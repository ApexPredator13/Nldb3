using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Services;

namespace Website.Data
{
    public class FloorRepository : IFloorRepository
    {
        private readonly IDbConnector _connector;

        public FloorRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        public async Task<int> CountFloors()
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT COUNT(*) FROM floors; ", c))
                {
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<string> SaveFloor(SaveFloor item)
        {
            string query = "INSERT INTO floors (id, name, exists_in, x, y, w, game_mode, color, mod, display_order, difficulty) VALUES (@I, @N, @E, @X, @Y, @W, @M, @C, @L, @O, @H) RETURNING id;";

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
                    q.Parameters.AddWithValue("@O", NpgsqlDbType.Integer, item.DisplayOrder);
                    q.Parameters.AddWithValue("@H", NpgsqlDbType.Integer, item.Difficulty);

                    var result = await q.ExecuteScalarAsync();
                    var type = result.GetType();
                    return Convert.ToString(result);
                }
            }
        }

        public async Task<Floor?> GetFloorById(string floorId, bool includeMod)
        {
            Floor? floor = null;

            var s = new StringBuilder();
            s.Append("SELECT f.id, f.name, f.exists_in, f.x, f.y, f.w, f.game_mode, f.color, f.display_order, f.difficulty");

            if (includeMod)
            {
                s.Append(", m.id, m.name, u.id, u.url, u.name");
            }

            s.Append(" FROM floors f");

            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON m.id = f.mod");
                s.Append(" LEFT JOIN mod_url u ON u.mod = m.id");
            }

            s.Append(" WHERE f.id = @Id;");

            using(var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Varchar, floorId);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;

                                if (floor is null)
                                {
                                    floor = new Floor()
                                    {
                                        Id = r.GetString(i++),
                                        Name = r.GetString(i++),
                                        ExistsIn = (ExistsIn)r.GetInt32(i++),
                                        X = r.GetInt32(i++),
                                        Y = r.GetInt32(i++),
                                        W = r.GetInt32(i++),
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.GetInt32(i++),
                                        Difficulty = r.GetInt32(i++),
                                        Mod = null
                                    };
                                }
                                else i += 8;

                                if (includeMod && floor.Mod is null && !r.IsDBNull(i))
                                {
                                    floor.Mod = new Mod()
                                    {
                                        Id = r.GetInt32(i++),
                                        ModName = r.GetString(i++)
                                    };
                                }
                                else i += 2;

                                if (includeMod && floor.Mod != null && !r.IsDBNull(i))
                                {
                                    floor.Mod.ModUrls.Add(new ModUrl()
                                    {
                                        Id = r.GetInt32(i++),
                                        Url = r.GetString(i++),
                                        LinkText = r.GetString(i++)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return floor;
        }

        public async Task<Floor?> GetFloorByName(string floorName, bool includeMod)
        {
            Floor? floor = null;

            var s = new StringBuilder();
            s.Append("SELECT f.id, f.name, f.exists_in, f.x, f.y, f.w, f.game_mode, f.color, f.display_order, f.difficulty");

            if (includeMod)
            {
                s.Append(", m.id, m.name, u.id, u.url, u.name");
            }

            s.Append(" FROM floors f");

            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON m.id = f.mod");
                s.Append(" LEFT JOIN mod_url u ON u.mod = m.id");
            }

            s.Append(" WHERE f.name = @N;");

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, floorName);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;

                                if (floor is null)
                                {
                                    floor = new Floor()
                                    {
                                        Id = r.GetString(i++),
                                        Name = r.GetString(i++),
                                        ExistsIn = (ExistsIn)r.GetInt32(i++),
                                        X = r.GetInt32(i++),
                                        Y = r.GetInt32(i++),
                                        W = r.GetInt32(i++),
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.GetInt32(i++),
                                        Difficulty = r.GetInt32(i++),
                                        Mod = null
                                    };
                                }
                                else i += 8;

                                if (includeMod && floor.Mod is null && !r.IsDBNull(i))
                                {
                                    floor.Mod = new Mod()
                                    {
                                        Id = r.GetInt32(i++),
                                        ModName = r.GetString(i++)
                                    };
                                }
                                else i += 2;

                                if (includeMod && floor.Mod != null && !r.IsDBNull(i))
                                {
                                    floor.Mod.ModUrls.Add(new ModUrl()
                                    {
                                        Id = r.GetInt32(i++),
                                        Url = r.GetString(i++),
                                        LinkText = r.GetString(i++)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return floor;
        }

        public async Task<List<Floor>> GetAllFloors(bool includeMod)
        {
            var result = new List<Floor>();

            var s = new StringBuilder();
            s.Append("SELECT f.id, f.name, f.exists_in, f.x, f.y, f.w, f.game_mode, f.color, f.display_order, f.difficulty");

            if (includeMod)
            {
                s.Append(", m.id, m.name, u.id, u.url, u.name");
            }

            s.Append(" FROM floors f");

            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON m.id = f.mod");
                s.Append(" LEFT JOIN mod_url u ON u.mod = m.id");
            }

            s.Append(" GROUP BY f.id");

            if (includeMod)
            {
                s.Append(", m.id, u.id");
            }

            s.Append(" ORDER BY f.display_order ASC;");

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;

                                string floorId = r.GetString(i);
                                if (!result.Any(x => x.Id == floorId))
                                {
                                    result.Add(new Floor()
                                    {
                                        Id = r.GetString(i++),
                                        Name = r.GetString(i++),
                                        ExistsIn = (ExistsIn)r.GetInt32(i++),
                                        X = r.GetInt32(i++),
                                        Y = r.GetInt32(i++),
                                        W = r.GetInt32(i++),
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.GetInt32(i++),
                                        Difficulty = r.GetInt32(i++),
                                        Mod = null
                                    });
                                }
                                else i += 8;

                                if (includeMod && result.First(x => x.Id == floorId).Mod is null && !r.IsDBNull(i))
                                {
                                    result.First(x => x.Id == floorId).Mod = new Mod()
                                    {
                                        Id = r.GetInt32(i++),
                                        ModName = r.GetString(i++)
                                    };
                                }
                                else i += 2;

                                if (includeMod && !r.IsDBNull(i) && !result.First(x => x.Id == floorId).Mod!.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                                {
                                    result.First(x => x.Id == floorId).Mod!.ModUrls.Add(new ModUrl()
                                    {
                                        Id = r.GetInt32(i++),
                                        Url = r.GetString(i++),
                                        LinkText = r.GetString(i++)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }

        public async Task<int> DeleteFloor(string floorId)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("DELETE FROM floors WHERE id = @Id;", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Varchar, floorId);
                    return await q.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
