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

        public async Task<List<int>> GetUsedModsForSubmittedEpisode(SubmittedEpisode episode)
        {
            var usedMods = new List<int>();

            // helper functions
            bool IsTrinketEventType(GameplayEventType eventType)
            {
                switch (eventType)
                {
                    case GameplayEventType.CollectedTrinket:
                        return true;
                    default:
                        return false;
                }
            }

            bool IsItemEvent(GameplayEventType eventType)
            {
                switch (eventType)
                {
                    case GameplayEventType.SkippedItem:
                    case GameplayEventType.CollectedItem:
                    case GameplayEventType.TouchedItem:
                        return true;
                    default:
                        return false;
                }
            }

            async Task ExecuteModQuery(string query, IEnumerable<NpgsqlParameter> parameters)
            {
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
            var collectedItems = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => IsItemEvent(z.EventType)).Select(a => a.RelatedResource1)));
            var collectedTrinkets = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => IsTrinketEventType(z.EventType)).Select(a => a.RelatedResource1)));
            var usedPills = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.UsedPill).Select(a => a.RelatedResource1)));
            var usedRunes = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.UsedRune).Select(a => a.RelatedResource1)));
            var usedOtherConsumables = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.UsedOtherConsumable).Select(a => a.RelatedResource1)));
            var foughtBosses = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.Bossfight).Select(a => a.RelatedResource1)));
            var itemsources = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => IsItemEvent(z.EventType)).Select(a => a.RelatedResource2)));

            var i = 0;

            // create all parameters
            var characterParameters = playedCharacters.Select(item => { i++; return new NpgsqlParameter($"@I{i}", NpgsqlDbType.Varchar) { NpgsqlValue = item }; }).ToList();
            var itemParameters = collectedItems.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var trinketParameters = collectedTrinkets.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var pillParameters = usedPills.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var runeParameters = usedRunes.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var otherParameters = usedOtherConsumables.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var bossParameters = foughtBosses.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var itemsourceParameters = itemsources.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();

            // find available mods for all resources
            if (characterParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM game_characters WHERE id IN ({string.Join(", ", characterParameters.Select(x => x.ParameterName))}) AND mod IS NOT NULL; ", characterParameters);
            if (itemParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM items WHERE id IN ({string.Join(", ", itemParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", itemParameters);
            if (trinketParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM trinkets WHERE id IN ({string.Join(", ", trinketParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", trinketParameters);
            if (pillParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM pills WHERE id IN ({string.Join(", ", pillParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", pillParameters);
            if (runeParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM runes WHERE id IN ({string.Join(", ", runeParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", runeParameters);
            if (otherParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM other_consumables WHERE id IN ({string.Join(", ", otherParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", otherParameters);
            if (bossParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM bosses WHERE id IN ({string.Join(", ", bossParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", bossParameters);
            if (itemsourceParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM item_sources WHERE id IN ({string.Join(", ", itemsourceParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", itemsourceParameters);

            // filter based on video title
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
