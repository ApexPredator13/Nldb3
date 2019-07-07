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
            var result = new StatsPageResult();

            var resourceTask = _isaacRepository.GetResourceById(id, false);
            var datesTask = _isaacRepository.GetEncounteredIsaacResourceTimestamps(id, 1);

            var resource = await resourceTask;

            if (resource is null)
            {
                return NotFound();
            }

            // history
            var dates = await datesTask;

            if (dates.Count is 0)
            {
                dates = await _isaacRepository.GetEncounteredIsaacResourceTimestamps(id, 2);
            }

            result.History = await _barGraphCreator.ThroughoutTheLetsPlay(resource.Name, dates, searchOptions);

            // found at ranking
            if (resource.ResourceType == ResourceType.Item)
            {
                var foundAtStats = await _isaacRepository.GetFoundAtRanking(id);
                result.FoundAtStats = _barGraphCreator.IsaacResourceRanking(resource.Name, foundAtStats);
            }

            // character ranking
            if (resource.ResourceType != ResourceType.Character)
            {
                var characterStats = await _isaacRepository.GetCharacterRanking(id, 1);
                if (characterStats.Count is 0)
                {
                    characterStats = await _isaacRepository.GetCharacterRanking(id, 2);
                }
                result.CharacterStats = _barGraphCreator.IsaacResourceRanking(resource.Name, characterStats);
            }

            return result;
        }
    }
}


