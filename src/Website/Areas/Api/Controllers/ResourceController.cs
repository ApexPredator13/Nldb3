using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Areas.Api.Models;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Services;
using Website.Models.SubmitEpisode;
using Website.Models;
using Website.Models.Resource;

namespace Website.Areas.Api.Controllers
{
    [ApiController, Area("api"), Route("[area]/resources")]
    public class ResourceController : Controller
    {
        private readonly IIsaacRepository _isaacRepository;
        private readonly IBarGraphCreator _barGraphCreator;

        public ResourceController(IIsaacRepository isaacRepository, IBarGraphCreator barGraphCreator)
        {
            _isaacRepository = isaacRepository;
            _barGraphCreator = barGraphCreator;
        }

        [HttpPost("history")]
        public async Task<History> GetHistory([FromBody] SubmittedCompleteEpisode episode)
        {
            var history = await _isaacRepository.GetHistory(episode);
            return history;
        }

        [HttpGet("{id}")]
        public async Task<IsaacResource?> Index(string id, bool includeMod = false)
        {
            return await _isaacRepository.GetResourceById(id, includeMod);
        }

        [HttpGet]
        public async Task<List<IsaacResource>> Index([FromQuery] GetResource resource)
        {
            return await _isaacRepository.GetResources(resource);
        }

        [HttpGet("effect")]
        public List<int> GetEffectNumber([FromQuery] params string[] name)
        {
            var result = new List<int>();
            var enumType = typeof(Effect);
            var effectNames = Enum.GetNames(enumType);

            foreach (var n in name)
            {
                string? exists = effectNames.FirstOrDefault(x => x.ToLower().IndexOf(n.ToLower()) != -1);

                if (exists != null)
                {
                    try
                    {
                        var enumValue = Convert.ToInt32((Effect)Enum.Parse(enumType, exists));
                        result.Add(enumValue);
                    }
                    catch
                    {
                        Console.WriteLine("failed to parse enum value");
                    }
                }
            }

            return result;
        }

        [HttpGet("next-floorset/{id}")]
        public async Task<List<IsaacResource>> GetNextFloorset([FromRoute] string id)
        {
            if (Enum.TryParse(typeof(Effect), $"ComesAfter{id}", out object effect))
            {
                var foundEffect = (Effect)effect;
                return await _isaacRepository.GetResources(new GetResource()
                {
                    RequiredTags = new List<Effect> { foundEffect },
                    ResourceType = ResourceType.Floor
                });
            }
            else
            {
                return new List<IsaacResource>();
            }
        }

        [HttpGet("{id}/Stats")]
        public async Task<ActionResult<StatsPageResult>> Dataset([FromRoute] string id, [FromQuery] IsaacResourceSearchOptions searchOptions)
        {
            var resource = await _isaacRepository.GetResourceById(id, false);

            if (resource is null)
            {
                return NotFound();
            }

            var result = new StatsPageResult();
            var awailableStats = GetAvailableStats(resource);
            var resourceNumber = GetResourceNumber(resource);

            // history
            if (awailableStats.Contains(RequiredStats.History))
            {
                var dates = await _isaacRepository.GetEncounteredIsaacResourceTimestamps(id, resourceNumber);
                result.History = await _barGraphCreator.ThroughoutTheLetsPlay(resource.Name, dates, searchOptions);
            }

            // 'found at' ranking
            if (awailableStats.Contains(RequiredStats.FoundAt))
            {
                var foundAtStats = await _isaacRepository.GetFoundAtRanking(id);
                result.FoundAtStats = _barGraphCreator.IsaacResourceRanking(resource.Name, foundAtStats);
            }

            // character ranking
            if (awailableStats.Contains(RequiredStats.Character))
            {
                var characterStats = await _isaacRepository.GetCharacterRanking(id, resourceNumber);
                result.CharacterStats = _barGraphCreator.IsaacResourceRanking(resource.Name, characterStats);
            }

            // curse ranking
            if (awailableStats.Contains(RequiredStats.Curse))
            {
                var curseStats = await _isaacRepository.GetCurseRanking(id, resourceNumber);
                result.CurseStats = _barGraphCreator.IsaacResourceRanking(resource.Name, curseStats);
            }

            return result;
        }

        private enum RequiredStats
        {
            History,
            FoundAt,
            Character,
            Curse
        }

        private List<RequiredStats> GetAvailableStats(IsaacResource resource)
        {
            switch (resource.ResourceType)
            {
                case ResourceType.Boss:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.Character:
                    return new List<RequiredStats>() { RequiredStats.Curse, RequiredStats.History };
                case ResourceType.CharacterReroll:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.Curse:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.History };
                case ResourceType.Enemy:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.Floor:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.Item:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.FoundAt, RequiredStats.History };
                case ResourceType.ItemSource:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.OtherConsumable:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.OtherEvent:
                    return new List<RequiredStats>() { RequiredStats.History };
                case ResourceType.Pill:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.Rune:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.TarotCard:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.Transformation:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                case ResourceType.Trinket:
                    return new List<RequiredStats>() { RequiredStats.Character, RequiredStats.Curse, RequiredStats.History };
                default:
                    return new List<RequiredStats>();
            }
        }

        private int GetResourceNumber(IsaacResource resource)
            => resource.ResourceType switch
            {
                ResourceType.ItemSource => 2,
                _ => 1
            };
    }
}


