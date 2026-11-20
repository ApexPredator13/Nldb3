using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using Website.Services;

namespace Website.Infrastructure
{
    public class SqlDumper : ISqlDumper
    {
        private static int _isDumping = 0;

        public static bool currentlyRecreatingDump => Volatile.Read(ref _isDumping) == 1;

        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<SqlDumper> _logger;

        public SqlDumper(IConfiguration config, IWebHostEnvironment env, ILogger<SqlDumper> logger)
        {
            _config = config;
            _env = env;
            _logger = logger;
        }

        public static string GetDumpFilePath(IWebHostEnvironment env)
        {
            return Path.Combine(env.ContentRootPath, "AppData", "dump", "nldb_dump.sql");
        }

        public void Dump()
        {
            if (Interlocked.CompareExchange(ref _isDumping, 1, 0) != 0)
            {
                _logger.LogWarning("Aborting - already dumping.");
                return;
            }

            var outputFilePath = GetDumpFilePath(_env);
            var outputDirectory = Path.GetDirectoryName(outputFilePath)!;
            var tempFilePath = outputFilePath + ".tmp";

            try
            {
                Directory.CreateDirectory(outputDirectory);

                var connectionString = _config.GetConnectionString("DefaultConnection");
                var csb = string.IsNullOrWhiteSpace(connectionString)
                    ? new NpgsqlConnectionStringBuilder()
                    : new NpgsqlConnectionStringBuilder(connectionString);

                var host = !string.IsNullOrWhiteSpace(csb.Host) ? csb.Host : _config["DefaultDatabaseHost"];
                var port = csb.Port > 0 ? csb.Port.ToString() : _config["DefaultDatabasePort"];
                var username = !string.IsNullOrWhiteSpace(csb.Username) ? csb.Username : _config["DefaultDatabaseUsername"];
                var password = !string.IsNullOrWhiteSpace(csb.Password) ? csb.Password : _config["DefaultDatabasePassword"];
                var database = !string.IsNullOrWhiteSpace(csb.Database) ? csb.Database : "nldb_new";

                if (string.IsNullOrWhiteSpace(host))
                {
                    _logger.LogError("database host is null in SqlDumper");
                    return;
                }

                if (string.IsNullOrWhiteSpace(username))
                {
                    _logger.LogError("database username is null in SqlDumper");
                    return;
                }

                if (string.IsNullOrWhiteSpace(database))
                {
                    _logger.LogError("database name is null in SqlDumper");
                    return;
                }

                var processInfo = new ProcessStartInfo
                {
                    FileName = "pg_dump",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    WorkingDirectory = _env.ContentRootPath
                };

                void addArgs(params string?[] args)
                {
                    foreach (var arg in args)
                        if (!string.IsNullOrEmpty(arg))
                            processInfo.ArgumentList.Add(arg);
                }

                addArgs(
                    "--no-password", "-U", username, "-h", host, "-p", port, "-n", "public", "--file", tempFilePath, database,
                    "--exclude-table=quote_votes", 
                    "--exclude-table=video_submissions_userdata", 
                    "--exclude-table=quotes_userdata",
                    "--exclude-table=discussion_topics_userdata",
                    "--exclude-table=problem_reports");

                if (!string.IsNullOrEmpty(password))
                {
                    processInfo.Environment["PGPASSWORD"] = password;
                }

                using var process = Process.Start(processInfo);
                if (process is null)
                {
                    _logger.LogError("Failed to start pg_dump process.");
                    return;
                }

                var stdOutTask = process.StandardOutput.ReadToEndAsync();
                var stdErrTask = process.StandardError.ReadToEndAsync();

                if (!process.WaitForExit((int)TimeSpan.FromSeconds(30).TotalMilliseconds))
                {
                    try { process.Kill(entireProcessTree: true); } catch { }
                    _logger.LogError("pg_dump timed out after 30 seconds and was terminated.");
                    return;
                }

                var stdOut = stdOutTask.GetAwaiter().GetResult();
                var stdErr = stdErrTask.GetAwaiter().GetResult();

                if (!string.IsNullOrWhiteSpace(stdOut))
                {
                    _logger.LogInformation("pg_dump stdout: {Output}", stdOut);
                }

                if (process.ExitCode != 0)
                {
                    _logger.LogError("pg_dump failed with exit code {ExitCode}: {Error}", process.ExitCode, stdErr);
                    return;
                }

                if (!string.IsNullOrWhiteSpace(stdErr))
                {
                    _logger.LogWarning("pg_dump stderr: {Error}", stdErr);
                }

                File.Move(tempFilePath, outputFilePath, overwrite: true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating the SQL dump.");
            }
            finally
            {
                if (File.Exists(tempFilePath))
                {
                    try { File.Delete(tempFilePath); } catch { }
                }

                Interlocked.Exchange(ref _isDumping, 0);
            }
        }
    }
}
