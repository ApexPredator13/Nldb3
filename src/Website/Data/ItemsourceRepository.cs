using Npgsql;
using NpgsqlTypes;
using System;
using System.Threading.Tasks;
using Website.Models.Validation;
using Website.Services;

namespace Website.Data
{
    public class ItemsourceRepository : IItemsourceRepository
    {
        private readonly IDbConnector _connector;

        public ItemsourceRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        public async Task SaveItemsource(SaveItemsource item)
        {
            string query = "INSERT INTO item_sources (id, name, exists_in, x, y, w, game_mode, color, mod) VALUES (@I, @N, @E, @X, @Y, @W, @M, @C, @L);";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, item.Id);
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, item.Name);
                    q.Parameters.AddWithValue("@E", NpgsqlDbType.Integer, (int)item.ExistsIn);
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Integer, item.X);
                    q.Parameters.AddWithValue("@Y", NpgsqlDbType.Integer, item.Y);
                    q.Parameters.AddWithValue("@W", NpgsqlDbType.Integer, item.W);
                    q.Parameters.AddWithValue("@M", NpgsqlDbType.Integer, (int)item.GameMode);
                    q.Parameters.AddWithValue("@C", NpgsqlDbType.Varchar, item.Color);
                    q.Parameters.AddWithValue("@L", NpgsqlDbType.Integer, item.FromMod ?? (object)DBNull.Value);

                    await q.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
