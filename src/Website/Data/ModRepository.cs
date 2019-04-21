﻿using Npgsql;
using NpgsqlTypes;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database.Enums;
using Website.Models.Validation;
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

        private bool IsItemEvent(GameplayEventType eventType)
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

        private bool IsTrinketEventType(GameplayEventType eventType)
        {
            switch (eventType)
            {
                case GameplayEventType.CollectedTrinket:
                    return true;
                default:
                    return false;
            }
        }

        public async Task<List<int>> GetUsedModsForSubmittedEpisode(SubmittedEpisode episode)
        {
            var usedMods = new List<int>();

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

            var playedCharacters = episode.PlayedCharacters.Select(x => x.CharacterId);
            var collectedItems = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => IsItemEvent(z.EventType)).Select(a => a.RelatedResource1)));
            var collectedTrinkets = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => IsTrinketEventType(z.EventType)).Select(a => a.RelatedResource1)));
            var usedPills = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.UsedPill).Select(a => a.RelatedResource1)));
            var usedRunes = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.UsedRune).Select(a => a.RelatedResource1)));
            var usedOtherConsumables = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.UsedOtherConsumable).Select(a => a.RelatedResource1)));
            var foughtBosses = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => z.EventType == GameplayEventType.Bossfight).Select(a => a.RelatedResource1)));
            var itemsources = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors.SelectMany(y => y.gameplayEvents.Where(z => IsItemEvent(z.EventType)).Select(a => a.RelatedResource2)));

            var i = 0;

            
                

            var characterParameters = playedCharacters.Select(item => { i++; return new NpgsqlParameter($"@I{i}", NpgsqlDbType.Varchar) { NpgsqlValue = item }; }).ToList();
            var itemParameters = collectedItems.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var trinketParameters = collectedTrinkets.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var pillParameters = usedPills.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var runeParameters = usedRunes.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var otherParameters = usedOtherConsumables.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var bossParameters = foughtBosses.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();
            var itemsourceParameters = itemsources.Select(item => new NpgsqlParameter($"@I{i++}", NpgsqlDbType.Varchar) { NpgsqlValue = item }).ToList();

            if (characterParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM game_characters WHERE id IN ({string.Join(", ", characterParameters.Select(x => x.ParameterName))}) AND mod IS NOT NULL; ", characterParameters);
            if (itemParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM items WHERE id IN ({string.Join(", ", itemParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", itemParameters);
            if (trinketParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM trinkets WHERE id IN ({string.Join(", ", trinketParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", trinketParameters);
            if (pillParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM pills WHERE id IN ({string.Join(", ", pillParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", pillParameters);
            if (runeParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM runes WHERE id IN ({string.Join(", ", runeParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", runeParameters);
            if (otherParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM other_consumables WHERE id IN ({string.Join(", ", otherParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", otherParameters);
            if (bossParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM bosses WHERE id IN ({string.Join(", ", bossParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", bossParameters);
            if (itemsourceParameters.Count() > 0) await ExecuteModQuery($"SELECT mod FROM item_sources WHERE id IN ({string.Join(", ", itemsourceParameters.Select(x => x.ParameterName ))}) AND mod IS NOT NULL; ", itemsourceParameters);

            return usedMods;
        }
    }
}
