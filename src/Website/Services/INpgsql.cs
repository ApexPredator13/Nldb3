using Npgsql;
using NpgsqlTypes;
using System.Threading.Tasks;

namespace Website.Services
{
    public interface INpgsql
    {
        Task<NpgsqlConnection> Connect();
        Task<int> NonQuery(string commandText, params NpgsqlParameter[] parameters);
        NpgsqlParameter Parameter(string parameterName, NpgsqlDbType type, object value);
    }
}
