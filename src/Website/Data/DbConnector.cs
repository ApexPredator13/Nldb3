using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Threading.Tasks;
using Website.Services;

namespace Website.Data
{
    public class DbConnector : IDbConnector
    {
        private readonly IConfiguration _config;

        public DbConnector(IConfiguration config)
        {
            _config = config;
        }

        public async Task<NpgsqlConnection> Connect()
        {
            var connection = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();
            return connection;
        }
    }
}
