using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;
using System.Threading.Tasks;
using Website.Services;

namespace Website.Data
{
    public class Npgsql : INpgsql
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;

        public Npgsql(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _env = env;
        }

        public async Task<NpgsqlConnection> Connect()
        {
            var connectionString = _env.EnvironmentName == "Testing"
                ? _config.GetConnectionString("TestConnection")
                : _config.GetConnectionString("DefaultConnection");

            var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            return connection;
        }

        public async Task<int> NonQuery(string commandText, params NpgsqlParameter[] parameters)
        {
            using var connection = await Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddRange(parameters);
            return await command.ExecuteNonQueryAsync();
        }

        public async Task<int?> ScalarInt(string commandText, params NpgsqlParameter[] parameters)
        {
            using var connection = await Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddRange(parameters);
            try
            {
                var result = await command.ExecuteScalarAsync();
                return System.Convert.ToInt32(result);
            }
            catch
            {
                return null;
            }
        }

        public async Task<string?> ScalarString(string commandText, params NpgsqlParameter[] parameters)
        {
            using var connection = await Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddRange(parameters);

            try
            {
                return System.Convert.ToString(await command.ExecuteScalarAsync());
            }
            catch
            {
                return null;
            }
        }

        public NpgsqlCommand Command(NpgsqlConnection connection, string commandText, params NpgsqlParameter[] parameters)
        {
            var command = new NpgsqlCommand(commandText, connection);

            foreach (var parameter in parameters)
            {
                command.Parameters.Add(parameter);
            }
            
            return command;
        }

        public NpgsqlParameter Parameter(string parameterName, NpgsqlDbType type, object value)
            => new NpgsqlParameter(parameterName, type) { NpgsqlValue = value };
    }
}


