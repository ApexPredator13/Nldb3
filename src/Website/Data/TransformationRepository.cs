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

        public async Task<string?> GetTransformationIdByName(string name)
        {
            string? result = null;

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT id FROM transformations WHERE name = @N; ", c))
                {
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, name);
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            r.Read();
                            result = r.GetString(0);
                        }
                    }
                }
            }

            return result;
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
            string query = $"INSERT INTO transformations (id, name, exists_in, x, y, w, game_mode, color, mod, items_needed) VALUES (@I, @N, @E, @X, @Y, @W, @M, @C, @L, DEFAULT);";

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

        //public async Task<List<(string id, int itemsNeeded)>> GetAvailableTransformationsForEpisode(DateTime episodeReleasedate, List<int>? usedMods)
        //{
        //    var availableTransformations = new List<(string, int)>();
        //    var parameters = new List<NpgsqlParameter>
        //    {
        //        new NpgsqlParameter("@VU", NpgsqlDbType.TimestampTz) { NpgsqlValue = episodeReleasedate }
        //    };

        //    var query = string.Empty;

        //    if (usedMods is null || usedMods.Count is 0)
        //    {
        //        query = "SELECT id, items_needed FROM transformations WHERE mod IS NULL AND valid_from < @VU AND valid_until > @VU; ";
        //    }
        //    else
        //    {
        //        var i = 0;
        //        var p = usedMods.Select(x => new NpgsqlParameter($"@T{i++}", NpgsqlDbType.Integer) { NpgsqlValue = x }).ToList();
        //        parameters.AddRange(p);
        //        query = $"SELECT id, items_needed FROM transformations WHERE valid_from < @VU AND valid_until > @VU AND (mod IS NULL OR mod IN ({string.Join(", ", p.Select(x => x.ParameterName))}))";
        //    }

        //    using (var c = await _connector.Connect())
        //    {
        //        using (var q = new NpgsqlCommand(query, c))
        //        {
        //            q.Parameters.AddRange(parameters.ToArray());
        //            using (var r = await q.ExecuteReaderAsync())
        //            {
        //                if (r.HasRows)
        //                {
        //                    while (r.Read())
        //                    {
        //                        availableTransformations.Add((r.GetString(0), r.GetInt32(1)));
        //                    }
        //                }
        //            }
        //        }
        //    }

        //    return availableTransformations;
        //}

        public async Task CreateTransformationItem(CreateTransformationItem item)
        {
            var query = "INSERT INTO transformation_items (item, transformation, counts_multiple_times, requires_title_content, valid_from, valid_until) VALUES (@I, @T, @C, @R, @V, @W); ";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, item.ItemId);
                    q.Parameters.AddWithValue("@T", NpgsqlDbType.Varchar, item.TransformationId);
                    q.Parameters.AddWithValue("@C", NpgsqlDbType.Boolean, item.CanCountMultipleTimes);
                    q.Parameters.AddWithValue("@R", NpgsqlDbType.Varchar, item.RequiresTitleContent ?? (object)DBNull.Value);
                    q.Parameters.AddWithValue("@V", NpgsqlDbType.Varchar, item.ValidFrom ?? (object)DBNull.Value);
                    q.Parameters.AddWithValue("@W", NpgsqlDbType.Varchar, item.ValidUntil ?? (object)DBNull.Value);

                    await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<List<(string transformation, bool countsMultipleTimes, int itemsNeeded)>> ItemCountsTowardsTransformations(string itemId, string videoTitle, DateTime videoReleasedate)
        {
            var result = new List<(string, bool, int)>();

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT t.transformation, t.counts_multiple_times, t.requires_title_content, x.items_needed FROM transformation_items t LEFT JOIN transformations x ON t.transformation = x.id WHERE item = @I AND valid_from < @R AND valid_until > @R; ", c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, itemId);
                    q.Parameters.AddWithValue("@R", NpgsqlDbType.TimestampTz, videoReleasedate);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                string? requiredTitleContent = r.IsDBNull(2) ? null : r.GetString(2);

                                if (requiredTitleContent != null && !videoTitle.ToLower().Contains(requiredTitleContent))
                                {
                                    continue;
                                }

                                result.Add((r.GetString(0), r.GetBoolean(1), r.GetInt32(3)));
                            }
                        }
                    }
                }
            }

            return result;
        }
    }
}
