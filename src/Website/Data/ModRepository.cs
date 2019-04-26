using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Models.Validation.SubmitEpisode;
using Website.Services;

namespace Website.Data
{
    public class ModRepository : IModRepository
    {
        private readonly IDbConnector _connector;

        public ModRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        public async Task<int> SaveMod(SaveMod mod)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("INSERT INTO mods (id, name) VALUES (DEFAULT, @N) RETURNING id; ", c))
                {
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, mod.ModName);
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<Mod?> GetModById(int id)
        {
            Mod? mod = null;
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT m.id, m.name, u.id, u.url, u.name FROM mods m LEFT JOIN mod_url u ON m.id = u.mod WHERE m.id = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, id);
                    
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;
                                if (mod is null)
                                {
                                    mod = new Mod()
                                    {
                                        Id = r.GetInt32(i++),
                                        ModName = r.GetString(i++)
                                    };
                                }
                                else i += 2;

                                if (!r.IsDBNull(i) && !mod.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                                {
                                    mod.ModUrls.Add(new ModUrl()
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

            return mod;
        }

        public async Task<Mod?> GetModByName(string name)
        {
            Mod? mod = null;
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT m.id, m.name, u.id, u.url, u.name FROM mods m LEFT JOIN mod_url u ON m.id = u.mod WHERE m.name = @N; ", c))
                {
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, name);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;
                                if (mod is null)
                                {
                                    mod = new Mod()
                                    {
                                        Id = r.GetInt32(i++),
                                        ModName = r.GetString(i++)
                                    };
                                }
                                else i += 2;

                                if (!r.IsDBNull(i) && !mod.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                                {
                                    mod.ModUrls.Add(new ModUrl()
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

            return mod;
        }

        public async Task<int?> GetModIdByName(string name)
        {
            int? result = null;

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT id FROM mods WHERE name = @N; ", c))
                {
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, name);
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            r.Read();
                            result = r.GetInt32(0);
                        }
                    }
                }
            }

            return result;
        }

        public async Task<int> CountMods()
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT COUNT(*) FROM mods;", c))
                {
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<List<int>> GetUsedModsForSubmittedEpisode(SubmittedEpisode episode)
        {
            var usedMods = new List<int>();

            // preparation
            var episodeName = string.Empty;
            var communityRemixId = 0;
            var antibirthId = 0;

            using (var c = await _connector.Connect())
            {
                // get episode name, to manually filter antibirth and community remix episodes
                using (var q = new NpgsqlCommand("SELECT title FROM videos WHERE id = @X", c))
                {
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Char, episode.VideoId);
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            r.Read();
                            episodeName = r.GetString(0);
                        }
                    }
                }

                // get mod ids of antibirth and community remix
                using (var q = new NpgsqlCommand("SELECT id FROM mods WHERE name = 'Community Remix'", c))
                {
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Char, episode.VideoId);
                    communityRemixId = Convert.ToInt32(await q.ExecuteScalarAsync());
                }
                using (var q = new NpgsqlCommand("SELECT id FROM mods WHERE name = 'Antibirth'", c))
                {
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Char, episode.VideoId);
                    antibirthId = Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }

            // extract all isaac resources
            var playedCharacters = episode.PlayedCharacters.Select(x => x.CharacterId);
            var playedFloors = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.Select(a => a.FloorId));
            var gameplayEvents = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents));

            var i = 0;

            // create all parameters
            var parameters = playedCharacters.Select(item => { i++; return new NpgsqlParameter($"@I{i}", NpgsqlDbType.Varchar) { NpgsqlValue = item }; }).ToList();
            parameters.AddRange(playedFloors.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList());
            parameters.AddRange(gameplayEvents.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item.RelatedResource1 }).ToList());

            // TODO create single query for transformative_resources

            if (parameters.Count() > 0)
            {
                using (var c = await _connector.Connect())
                {
                    using (var q = new NpgsqlCommand($"SELECT mod FROM isaac_resources WHERE mod IS NOT NULL AND id IN ({string.Join(", ", parameters.Select(x => x.ParameterName))}); ", c))
                    {
                        q.Parameters.AddRange(parameters.ToArray());
                        using (var r = await q.ExecuteReaderAsync())
                        {
                            if (r.HasRows)
                            {
                                while (r.Read())
                                {
                                    if (!r.IsDBNull(0) && !usedMods.Contains(r.GetInt32(0)))
                                    {
                                        usedMods.Add(r.GetInt32(0));
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // remove mods if video title doesn't match up
            if (usedMods.Contains(communityRemixId) && !episodeName.ToLower().Contains("community remix"))
            {
                usedMods.Remove(communityRemixId);
            }
            if (usedMods.Contains(antibirthId) && !episodeName.ToLower().Contains("antibirth"))
            {
                usedMods.Remove(antibirthId);
            }

            return usedMods;
        }

        public async Task<int> AddModUrl(AddModUrl modUrl)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("INSERT INTO mod_url (id, url, name, mod) VALUES (DEFAULT, @U, @N, @M) RETURNING id; ", c))
                {
                    q.Parameters.AddWithValue("@U", NpgsqlDbType.Varchar, modUrl.Url);
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, modUrl.LinkText);
                    q.Parameters.AddWithValue("@M", NpgsqlDbType.Integer, modUrl.ModId);
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<int> RemoveModUrl(int modUrlId)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("DELETE FROM mod_url WHERE id = @Id", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, modUrlId);
                    return await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<int> RemoveMod(int modId)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("DELETE FROM mods WHERE id = @Id", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, modId);
                    return await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<ModUrl?> GetModUrlById(int id)
        {
            ModUrl? url = null;

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT id, url, name FROM mod_url WHERE id = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, id);
                    
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            r.Read();
                            url = new ModUrl()
                            {
                                Id = r.GetInt32(0),
                                Url = r.GetString(1),
                                LinkText = r.GetString(2)
                            };
                        }
                    }
                }
            }

            return url;
        }
    }
}
