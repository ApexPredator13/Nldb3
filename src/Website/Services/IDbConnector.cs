using Npgsql;
using System.Threading.Tasks;

namespace Website.Services
{
    public interface IDbConnector
    {
        Task<NpgsqlConnection> Connect();
    }
}
