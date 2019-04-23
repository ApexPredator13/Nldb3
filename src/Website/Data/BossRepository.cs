using Npgsql;
using NpgsqlTypes;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Services;

namespace Website.Data
{
    public class BossRepository : IBossRepository
    {
        private readonly IDbConnector _connector;

        public BossRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        public async Task<int> CountBosses()
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT COUNT(*) FROM bosses; ", c))
                {
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task SaveBoss(SaveBossModel item)
        {
            string query = "INSERT INTO bosses (id, double_trouble, name, exists_in, x, y, w, game_mode, color, mod) VALUES (@I, @D, @N, @E, @X, @Y, @W, @M, @C, @L);";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, item.Id);
                    q.Parameters.AddWithValue("@D", NpgsqlDbType.Boolean, item.DoubleTrouble);
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

        public async Task<Boss?> GetBossById(string id, bool includeMod, bool includeTags)
        {
            Boss? result = null;

            var s = new StringBuilder();
            s.Append($"SELECT b.id as {nameof(Boss.Id)}, b.double_trouble as {nameof(Boss.DoubleTrouble)}, b.name as {nameof(Boss.Name)}, b.exists_in as {nameof(Boss.ExistsIn)}, b.x as {nameof(Boss.X)}, b.y as {nameof(Boss.Y)}, b.w as {nameof(Boss.W)}, b.game_mode as {nameof(Boss.GameMode)}, b.color as {nameof(Boss.Color)}");

            if (includeMod)
            {
                s.Append($", m.id {nameof(Mod.Id)}, m.name {nameof(Mod.ModName)}, u.url {nameof(ModUrl.Url)}, u.name {nameof(ModUrl.LinkText)}");
            }
            if (includeTags)
            {
                s.Append($", t.id {nameof(BossTag.Id)}, t.value {nameof(BossTag.Effect)}");
            }

            s.Append(" FROM bosses b");

            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON b.mod = m.id");
                s.Append(" LEFT JOIN mod_url u ON m.id = u.mod");
            }
            if (includeTags)
            {
                s.Append(" LEFT JOIN boss_tags t ON t.boss = b.id");
            }

            s.Append(" WHERE b.id = @id; ");

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddWithValue("@id", NpgsqlDbType.Varchar, id);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;
                                if (result is null)
                                {
                                    result = new Boss()
                                    {
                                        Id = r.GetString(i++),
                                        DoubleTrouble = r.GetBoolean(i++),
                                        Name = r.GetString(i++),
                                        ExistsIn = (ExistsIn)r.GetInt32(i++),
                                        X = r.GetInt32(i++),
                                        Y = r.GetInt32(i++),
                                        W = r.GetInt32(i++),
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++)
                                    };
                                }
                                else i += 9;

                                if (includeMod && !r.IsDBNull(i) && result.Mod is null)
                                {
                                    result.Mod = new Mod()
                                    {
                                        ModName = r.GetString(i++),
                                    };
                                }
                                else i += 1;

                                if (includeMod && !r.IsDBNull(i) && result.Mod != null && !result.Mod.ModUrls.Any(x => x.Url == r.GetString(i)))
                                {
                                    result.Mod.ModUrls.Add(new ModUrl()
                                    {
                                        Url = r.GetString(i++),
                                        LinkText = r.GetString(i++)
                                    });
                                }
                                if (includeTags && !r.IsDBNull(i) && !result.BossTags.Any(x => x.Id == r.GetInt32(i)))
                                {
                                    result.BossTags.Add(new BossTag()
                                    {
                                        Id = r.GetInt32(i++),
                                        Effect = (Effect)r.GetInt32(i)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }
    }
}
