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

        //[HttpPost("history")]
        //public async Task<History> GetHistory([FromBody] SubmittedCompleteEpisode episode)
        //{
        //    var history = await _isaacRepository.GetHistory(episode);
        //    return history;
        //}

        //[HttpGet("{id}")]
        //public async Task<IsaacResource?> Index(string id, bool includeMod = false)
        //{
        //    return await _isaacRepository.GetResourceById(id, includeMod);
        //}

        //[HttpGet]
        //public async Task<List<IsaacResource>> Index([FromQuery] GetResource resource)
        //{
        //    return await _isaacRepository.GetResources(resource);
        //}

        //[HttpGet("effect")]
        //public List<int> GetEffectNumber([FromQuery] params string[] name)
        //{
        //    var result = new List<int>();
        //    var enumType = typeof(Tag);
        //    var effectNames = Enum.GetNames(enumType);

        //    foreach (var n in name)
        //    {
        //        string? exists = effectNames.FirstOrDefault(x => x.ToLower().IndexOf(n.ToLower()) != -1);

        //        if (exists != null)
        //        {
        //            try
        //            {
        //                var enumValue = Convert.ToInt32((Tag)Enum.Parse(enumType, exists));
        //                result.Add(enumValue);
        //            }
        //            catch
        //            {
        //                Console.WriteLine("failed to parse enum value");
        //            }
        //        }
        //    }

        //    return result;
        //}

        //[HttpGet("next-floorset/{id}")]
        //public async Task<List<IsaacResource>> GetNextFloorset([FromRoute] string id)
        //{
        //    if (Enum.TryParse(typeof(Tag), $"ComesAfter{id}", out object? effect))
        //    {
        //        if (effect is null)
        //        {
        //            return new List<IsaacResource>();
        //        }

        //        var foundEffect = (Tag)effect;
        //        return await _isaacRepository.GetResources(new GetResource()
        //        {
        //            RequiredTags = new List<Tag> { foundEffect },
        //            ResourceType = ResourceType.Floor
        //        });
        //    }
        //    else
        //    {
        //        return new List<IsaacResource>();
        //    }
        //}

        [HttpGet("{id}/Type")]
        public async Task<int> GetResourceType([FromRoute] string id)
        {
            return Convert.ToInt32(await _isaacRepository.GetResourceTypeFromId(id));
        }

        [HttpGet("{id}/Stats")]
        public async Task<ActionResult<StatsPageResult>> Dataset([FromRoute] string id, [FromQuery] IsaacResourceSearchOptions searchOptions)
        {
            var resource = await _isaacRepository.GetResourceById(id, false);
            
            if (resource is null)
            {
                return NotFound();
            }

            GameplayEventType? eventType = null;

            if (resource.ResourceType == ResourceType.Transformation)
            {
                eventType = GameplayEventType.TransformationComplete;
            }

            var result = new StatsPageResult();
            var availableStats = _isaacRepository.GetAvailableStats(resource);
            var resourceNumber = _isaacRepository.GetResourceNumber(resource);

            // history
            if (availableStats.Contains(AvailableStats.History))
            {
                var dates = await _isaacRepository.GetEncounteredIsaacResourceTimestamps(id, resourceNumber, eventType);
                result.History = await _barGraphCreator.ThroughoutTheLetsPlay(resource.Name, dates, searchOptions);
            }

            // 'found at' ranking
            if (availableStats.Contains(AvailableStats.FoundAt))
            {
                var foundAtStats = await _isaacRepository.GetFoundAtRanking(id);
                result.FoundAtStats = _barGraphCreator.IsaacResourceRanking(resource.Name, foundAtStats);
            }

            // character ranking
            if (availableStats.Contains(AvailableStats.Character))
            {
                var characterStats = await _isaacRepository.GetCharacterRanking(id, resourceNumber);
                result.CharacterStats = _barGraphCreator.IsaacResourceRanking(resource.Name, characterStats);
            }

            // curse ranking
            if (availableStats.Contains(AvailableStats.Curse))
            {
                var curseStats = await _isaacRepository.GetCurseRanking(id, resourceNumber);
                result.CurseStats = _barGraphCreator.IsaacResourceRanking(resource.Name, curseStats);
            }

            // floor ranking
            if (availableStats.Contains(AvailableStats.Floor))
            {
                var floorStats = await _isaacRepository.GetFloorRanking(id, resourceNumber);
                result.FloorStats = _barGraphCreator.IsaacResourceRanking(resource.Name, floorStats);
            }

            // transformation item ranking
            if (availableStats.Contains(AvailableStats.TransformationItemRanking))
            {
                var itemRanking = await _isaacRepository.GetTransformationItemRanking(id);
                result.TransformationItemRanking = _barGraphCreator.IsaacResourceRanking(resource.Name, itemRanking);
            }

            return result;
        }
    }
}


