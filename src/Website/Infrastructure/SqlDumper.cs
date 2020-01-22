using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Diagnostics;
using Website.Services;

namespace Website.Infrastructure
{
    public class SqlDumper : ISqlDumper
    {
        public static bool currentlyRecreatingDump = false;
        
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;

        public SqlDumper(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _env = env;
        }

        public void Dump()
        {
            // postgresql password file must exist on the server:
            // as user who executes the website:
            // $ touch ~/.pgpass
            // $ chmod 0600 ~/.pgpass
            // content:
            // host:port:database:user:password

            var username = _config["DefaultDatabaseUsername"];
            var host = _config["DefaultDatabaseHost"];
            var password = _config["DefaultDatabasePassword"];

            var outputPath = Path.Combine(_env.WebRootPath, "dump");
            var outputFilePath = Path.Combine(outputPath, "nldb_dump.sql");
            Directory.CreateDirectory(outputPath);

            // we are not running on windows anymore, so this is useless now:
            // ==============================================================
            // assumes "development" is on windows, "production" on linux
            // if (_env.IsDevelopment())
            // {
            //     // creates a temporary batch file
            //     var batchfilePath = Path.Combine(_env.ContentRootPath, "dump.bat");
            //     var setPgPasswordLine = $"SET PGPASSWORD={password}";

            //     // path to pg_dump must be wrapped in "..."
            //     var dumpDatabaseLine =
            //         "\"C:\\Program Files\\PostgreSQL\\10\\bin\\pg_dump\" " +    // default path to pg_dump
            //         "-w " +
            //         $"-U {username} " +
            //         $"-h {host} " +
            //         "-n public " +
            //         "--exclude-table=quote_votes " +
            //         "--exclude-table=video_submissions_userdata " +
            //         "--exclude-table=quotes_userdata " +
            //         "--exclude-table=discussion_topics_userdata " +
            //         $"nldb_new > {outputFilePath}";

            //     // writes batch file
            //     using var sw = new StreamWriter(batchfilePath);
            //     sw.WriteLine(setPgPasswordLine);
            //     sw.WriteLine(dumpDatabaseLine);
            //     sw.Flush();
            //     sw.Close();

            //     // runs batch file in cmd.exe. because the first command includes a path with spaces, 
            //     // the whole thing must be wrapped in quotation marks  "..."
            //     var processInfo = new ProcessStartInfo("cmd.exe", "/c \"" + setPgPasswordLine + "\" && " + dumpDatabaseLine)
            //     {
            //         CreateNoWindow = true,
            //         UseShellExecute = false,
            //         RedirectStandardOutput = true,
            //         RedirectStandardError = true,
            //         WorkingDirectory = _env.ContentRootPath,
            //         FileName = "dump.bat"
            //     };

            //     var process = Process.Start(processInfo);
            //     while (!process.StandardOutput.EndOfStream)
            //     {
            //         Console.WriteLine(process.StandardOutput.ReadLine());
            //     }
            //     while (!process.StandardError.EndOfStream)
            //     {
            //         Console.WriteLine(process.StandardError.ReadLine());
            //     }
            //     process.WaitForExit();
            //     process.Close();

            //     File.Delete(batchfilePath);
            // }
            // else if (_env.IsProduction())
            // {

            var dumpDatabaseLine =
                "-c \"pg_dump " +
                "-w " +
                $"-U {username} " +
                $"-h {host} " +
                "-n public " +
                "--exclude-table=quote_votes " +
                "--exclude-table=video_submissions_userdata " +
                "--exclude-table=quotes_userdata " +
                "--exclude-table=discussion_topics_userdata " +
                $"nldb_new > {outputFilePath}\"";

            var processInfo = new ProcessStartInfo("/bin/bash", dumpDatabaseLine)
            {
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                WorkingDirectory = _env.ContentRootPath
            };

            currentlyRecreatingDump = true;

            var process = Process.Start(processInfo);

            while (!process.StandardOutput.EndOfStream)
            {
                Console.WriteLine(process.StandardOutput.ReadLine());
            }
            while (!process.StandardError.EndOfStream)
            {
                Console.WriteLine(process.StandardError.ReadLine());
            }
            process.WaitForExit();
            process.Close();

            currentlyRecreatingDump = false;
            // }
        }
    }
}
