using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Validation;
using Website.Services;

namespace Website.Data
{
    public class TransformationRepository : ITransformationRepository
    {
        private readonly IDbConnector _connector;

        public TransformationRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        public async Task<int> CountTransformations()
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT COUNT(*) FROM transformations; ", c))
                {
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task SaveTransformation(SaveTransformation item)
        {
            string query = "INSERT INTO transformations (id, name, exists_in, x, y, w, game_mode, color, mod, items_needed) VALUES (@I, @N, @E, @X, @Y, @W, @M, @C, @L, @X);";

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
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Integer, item.ItemsNeeded);

                    await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<List<string>> GetAvailableTransformationsForEpisode(DateTime episodeReleasedate, List<int>? usedMods)
        {
            var availableTransformations = new List<string>();
            var parameters = new List<NpgsqlParameter>();

            var query = string.Empty;

            if (usedMods is null || usedMods.Count is 0)
            {
                query = "SELECT id FROM transformations WHERE mod IS NULL AND valid_from < @VU AND valid_until > @VU; ";
                parameters.Add(new NpgsqlParameter("@VU", NpgsqlDbType.TimestampTz) { NpgsqlValue = episodeReleasedate });
            }
            else
            {
                var i = 0;
                var p = usedMods.Select(x => ($"@T{i}", new NpgsqlParameter($"@T{i++}", NpgsqlDbType.Integer) { NpgsqlValue = x }));
                parameters.AddRange(p.Select(x => x.Item2).ToList());
                query = $"SELECT id FROM transformations WHERE valid_from < @VU AND valid_until > @VU AND (mod IS NULL OR mod IN ({string.Join(", ", p.Select(x => x.Item1))}))";
            }

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddRange(parameters.ToArray());
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                availableTransformations.Add(r.GetString(0));
                            }
                        }
                    }
                }
            }

            return availableTransformations;
        }
    }
}
