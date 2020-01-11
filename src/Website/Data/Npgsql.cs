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

        public Npgsql(IConfiguration config)
        {
            _config = config;
        }

        public async Task<NpgsqlConnection> Connect()
        {
            var connection = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
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
                return System.Convert.ToInt32(await command.ExecuteScalarAsync());
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

        public NpgsqlParameter Parameter(string parameterName, NpgsqlDbType type, object value)
            => new NpgsqlParameter(parameterName, type) { NpgsqlValue = value };
    }
}


