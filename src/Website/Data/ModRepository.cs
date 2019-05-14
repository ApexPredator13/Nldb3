using Microsoft.AspNetCore.Authorization;
using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
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

        public async Task<int> SaveMod(CreateMod mod)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("INSERT INTO mods (id, name) VALUES (DEFAULT, @N) RETURNING id; ", c);
            q.Parameters.AddWithValue("@N", NpgsqlDbType.Text, mod.ModName);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<List<Mod>> GetAllMods()
        {
            var result = new List<Mod>();

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT m.id, m.name, u.id, u.url, u.name FROM mods m LEFT JOIN mod_url u ON u.mod = m.id;", c);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    if (!result.Any(m => m.Id == r.GetInt32(0)))
                    {
                        result.Add(new Mod()
                        {
                            Id = r.GetInt32(0),
                            ModName = r.GetString(1),
                            ModUrls = new List<ModUrl>()
                        });
                    }
                    if (!r.IsDBNull(2) && !result.First(m => m.Id == r.GetInt32(0)).ModUrls.Any(u => u.Id == r.GetInt32(2)))
                    {
                        result.First(m => m.Id == r.GetInt32(0)).ModUrls.Add(new ModUrl()
                        {
                            Id = r.GetInt32(2),
                            Url = r.GetString(3),
                            LinkText = r.GetString(4)
                        });
                    }
                }
            }

            return result;
        }

        public async Task<Mod?> GetModById(int id)
        {
            Mod? mod = null;
            using var c = await _connector.Connect();

            using var q = new NpgsqlCommand("SELECT m.id, m.name, u.id, u.url, u.name FROM mods m LEFT JOIN mod_url u ON m.id = u.mod WHERE m.id = @Id; ", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, id);

            using var r = await q.ExecuteReaderAsync();
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

            return mod;
        }

        public async Task<Mod?> GetModByName(string name)
        {
            Mod? mod = null;
            using var c = await _connector.Connect();
            
            using var q = new NpgsqlCommand("SELECT m.id, m.name, u.id, u.url, u.name FROM mods m LEFT JOIN mod_url u ON m.id = u.mod WHERE m.name = @N; ", c);
            q.Parameters.AddWithValue("@N", NpgsqlDbType.Text, name);

            using var r = await q.ExecuteReaderAsync();
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

            return mod;
        }

        public async Task<int?> GetModIdByName(string name)
        {
            int? result = null;

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT id FROM mods WHERE name = @N; ", c);
            q.Parameters.AddWithValue("@N", NpgsqlDbType.Text, name);

            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                r.Read();
                result = r.GetInt32(0);
            }
            

            return result;
        }

        public async Task<int> CountMods()
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT COUNT(*) FROM mods;", c);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<List<int>> GetUsedModsForSubmittedEpisode(SubmittedCompleteEpisode episode)
        {
            var usedMods = new List<int>();

            // preparation
            var episodeName = string.Empty;
            var communityRemixId = 0;
            var antibirthId = 0;

            using (var c = await _connector.Connect())
            {
                // get episode name, to manually filter antibirth and community remix episodes
                using var getTitleCommand = new NpgsqlCommand("SELECT title FROM videos WHERE id = @X", c);
                getTitleCommand.Parameters.AddWithValue("@X", NpgsqlDbType.Text, episode.VideoId);

                using var reader = await getTitleCommand.ExecuteReaderAsync();
                if (reader.HasRows)
                {
                    reader.Read();
                    episodeName = reader.GetString(0);
                }
            }

            using (var c = await _connector.Connect())
            {
                // get mod ids of antibirth and community remix
                using var getCommunityRemixIdCommand = new NpgsqlCommand("SELECT id FROM mods WHERE name = 'Community Remix'", c);
                getCommunityRemixIdCommand.Parameters.AddWithValue("@X", NpgsqlDbType.Text, episode.VideoId);
                communityRemixId = Convert.ToInt32(await getCommunityRemixIdCommand.ExecuteScalarAsync());

                using var getAntibirthModIdCommand = new NpgsqlCommand("SELECT id FROM mods WHERE name = 'Antibirth'", c);
                getAntibirthModIdCommand.Parameters.AddWithValue("@X", NpgsqlDbType.Text, episode.VideoId);
                antibirthId = Convert.ToInt32(await getAntibirthModIdCommand.ExecuteScalarAsync());


                // extract all isaac resources
                var playedCharacters = episode.PlayedCharacters.Select(x => x.CharacterId);
                var playedFloors = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.Select(a => a.FloorId));
                var gameplayEvents = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.GameplayEvents));

                var i = 0;

                // create all parameters
                var parameters = playedCharacters.Select(item => { i++; return new NpgsqlParameter($"@I{i}", NpgsqlDbType.Text) { NpgsqlValue = item }; }).ToList();
                parameters.AddRange(playedFloors.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Text) { NpgsqlValue = item }).ToList());
                parameters.AddRange(gameplayEvents.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Text) { NpgsqlValue = item.RelatedResource1 }).ToList());

                // TODO create single query for transformative_resources

                if (parameters.Count() > 0)
                {
                    using var getModsCommand = new NpgsqlCommand($"SELECT mod FROM isaac_resources WHERE mod IS NOT NULL AND id IN ({string.Join(", ", parameters.Select(x => x.ParameterName))}); ", c);
                    getModsCommand.Parameters.AddRange(parameters.ToArray());
                    using var getModsReader = await getModsCommand.ExecuteReaderAsync();
                    if (getModsReader.HasRows)
                    {
                        while (getModsReader.Read())
                        {
                            if (!getModsReader.IsDBNull(0) && !usedMods.Contains(getModsReader.GetInt32(0)))
                            {
                                usedMods.Add(getModsReader.GetInt32(0));
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
            }

                

            return usedMods;
        }

        public async Task<int> AddModUrl(CreateModLink modUrl)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("INSERT INTO mod_url (id, url, name, mod) VALUES (DEFAULT, @U, @N, @M) RETURNING id; ", c);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, modUrl.Url);
            q.Parameters.AddWithValue("@N", NpgsqlDbType.Text, modUrl.LinkText);
            q.Parameters.AddWithValue("@M", NpgsqlDbType.Integer, modUrl.ModId);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<int> RemoveModUrl(int modUrlId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("DELETE FROM mod_url WHERE id = @Id", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, modUrlId);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<int> RemoveMod(int modId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("DELETE FROM mods WHERE id = @Id", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, modId);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<ModUrl?> GetModUrlById(int id)
        {
            ModUrl? url = null;

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT id, url, name FROM mod_url WHERE id = @Id; ", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, id);

            using var r = await q.ExecuteReaderAsync();
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

            return url;
        }
    }
}
