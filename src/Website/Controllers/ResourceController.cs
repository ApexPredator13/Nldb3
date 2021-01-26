using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Models;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Resource;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Route("Api/Resources")]
    public class ResourceController : Controller
    {
        public const string Controllername = "Resource";
        
        private readonly IIsaacRepository _isaacRepository;
        private readonly IBarGraphCreator _barGraphCreator;

        public ResourceController(IIsaacRepository isaacRepository, IBarGraphCreator barGraphCreator)
        {
            _isaacRepository = isaacRepository;
            _barGraphCreator = barGraphCreator;
        }

        [HttpGet("test")]
        public BadRequestObjectResult Test() => BadRequest("This is a test");

        [HttpGet]
        public async Task<List<IsaacResource>> GetResources([FromQuery] GetResource searchOptions)
        {
            return await _isaacRepository.GetResources(searchOptions);
        }

        [HttpGet("{id}")]
        public async Task<IsaacResource?> GetResource(string id, bool includeMod = false)
        {
            return await _isaacRepository.GetResourceById(id, includeMod);
        }

        [HttpPost("history")]
        public async Task<History> GetHistory([FromBody] SubmittedCompleteEpisode episode)
        {
            var history = await _isaacRepository.GetHistory(episode);
            return history;
        }

        [HttpGet("common-bosses-for-floor/{floorId}")]
        public async Task<List<IsaacResource>> GetRequiredTagForCommonBosses([FromRoute] string floorId)
        {
            if (Enum.TryParse(typeof(Tag), $"AppearsOn{floorId}", out object? tag))
            {
                if (tag is null)
                {
                    return new List<IsaacResource>();
                }

                var foundTag = (Tag)tag;
                var foundBosses = await _isaacRepository.GetResources(new GetResource()
                {
                    RequiredTags = new List<Tag> { foundTag },
                    ResourceType = ResourceType.Boss
                });

                return foundBosses;
            }
            else
            {
                return new List<IsaacResource>();
            }
        }

        [HttpGet("next-floorset/{currentFloorId}")]
        public async Task<List<IsaacResource>> GetNextFloorset([FromRoute] string currentFloorId)
        {
            if (Enum.TryParse(typeof(Tag), $"ComesAfter{currentFloorId}", true, out object? tag))
            {
                if (tag is null)
                {
                    return new List<IsaacResource>();
                }

                var foundTag = (Tag)tag;
                var foundFloors = await _isaacRepository.GetResources(new GetResource()
                {
                    RequiredTags = new List<Tag> { foundTag },
                    ResourceType = ResourceType.Floor
                });

                return foundFloors;
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

            GameplayEventType? eventType = null;

            if (resource.ResourceType == ResourceType.Transformation)
            {
                eventType = GameplayEventType.TransformationComplete;
            }

            var result = new StatsPageResult()
            {
                Resource = resource
            };

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
                var floorStats = await _isaacRepository.GetFloorRanking(id, resourceNumber, eventType);
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


