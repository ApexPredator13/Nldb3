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

        [HttpGet("most-common-items/{itemSourceId}/{amount}")]
        public async Task<List<IsaacResource>> GetMostCommonItemsForItemSource([FromRoute] string itemSourceId, [FromRoute] int amount)
            => await _isaacRepository.MostCommonItemsForItemSource(itemSourceId, amount);
        

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
            List<Tag> requiredTags = currentFloorId switch
            {
                "BlueWomb" => new() { Tag.ComesAfterBlueWomb },
                "AshpitOne" => new() { Tag.ComesAfterAshpitOne },
                "AshpitTwo" => new() { Tag.ComesAfterAshpitTwo },
                "AshpitXL" => new() { Tag.ComesAfterAshpitXl },
                "BasementOne" => new() { Tag.ComesAfterBasementOne },
                "BasementTwo" => new() { Tag.ComesAfterBasementTwo },
                "BasementXL" => new() { Tag.ComesAfterBasementXl },
                "CatacombsOne" => new() { Tag.ComesAfterCatacombsOne },
                "CatacombsTwo" => new() { Tag.ComesAfterCatacombsTwo },
                "CatacombsXL" => new() { Tag.ComesAfterCatacombsXl },
                "Cathedral" => new() { Tag.ComesAfterCathedral },
                "CavesOne" => new() { Tag.ComesAfterCavesOne },
                "CavesTwo" => new() { Tag.ComesAfterCavesTwo },
                "CavesXL" => new() { Tag.ComesAfterCavesXl },
                "CellarOne" => new() { Tag.ComesAfterCellarOne },
                "CellarTwo" => new() { Tag.ComesAfterCellarTwo },
                "CellarXL" => new() { Tag.ComesAfterCellarXl },
                "Chest" => new() { Tag.ComesAfterChest },
                "CorpseOne" => new() { Tag.ComesAfterCorpseOne },
                "CorpseTwo" => new() { Tag.ComesAfterCorpseTwo },
                "CorpseXL" => new() { Tag.ComesAfterCorpseXl },
                "DankDepthsOne" => new() { Tag.ComesAfterDankDepthsOne },
                "DankDepthsTwo" => new() { Tag.ComesAfterDankDepthsTwo },
                "DankDepthsXL" => new() { Tag.ComesAfterDankDepthsXl },
                "DarkRoom" => new() { Tag.ComesAfterDarkRoom },
                "DepthsOne" => new() { Tag.ComesAfterDepthsOne },
                "DepthsTwo" => new() { Tag.ComesAfterDepthsTwo },
                "DepthsXL" => new() { Tag.ComesAfterDepthsXl },
                "DownpourOne" => new() { Tag.ComesAfterDownpourOne },
                "DownpourTwo" => new() { Tag.ComesAfterDownpourTwo },
                "DownpourXL" => new() { Tag.ComesAfterDownpourXl },
                "DrossOne" => new() { Tag.ComesAfterDrossOne },
                "DrossTwo" => new() { Tag.ComesAfterDrossTwo },
                "DrossXL" => new() { Tag.ComesAfterDrossXl },
                "FloodedCavesOne" => new() { Tag.ComesAfterFloodedCavesOne },
                "FloodedCavesTwo" => new() { Tag.ComesAfterFloodedCavesTwo },
                "FloodedCavesXL" => new() { Tag.ComesAfterFloodedCavesXl },
                "GehennaOne" => new() { Tag.ComesAfterGehennaOne },
                "GehennaTwo" => new() { Tag.ComesAfterGehennaTwo },
                "GehennaXL" => new() { Tag.ComesAfterGehennaXl },
                "GreedModeBasement" => new() { Tag.ComesAfterGreedModeBasement },
                "GreedModeCaves" => new() { Tag.ComesAfterGreedModeCaves },
                "GreedModeDepths" => new() { Tag.ComesAfterGreedModeDepths },
                "GreedModeSheol" => new() { Tag.ComesAfterGreedModeSheol },
                "GreedModeTheShop" => new() { Tag.ComesAfterGreedModeTheShop },
                "GreedModeUltraGreed" => new() { Tag.ComesAfterGreedModeUltraGreed },
                "GreedModeWomb" => new() { Tag.ComesAfterGreedModeWomb },
                "Home" => new() { Tag.ComesAfterHome },
                "MausoleumOne" => new() { Tag.ComesAfterMausoleumOne },
                "MausoleumTwo" => new() { Tag.ComesAfterMausoleumTwo },
                "MausoleumXL" => new() { Tag.ComesAfterMausoleumXl },
                "MinesOne" => new() { Tag.ComesAfterMinesOne },
                "MinesTwo" => new() { Tag.ComesAfterMinesTwo },
                "MinesXL" => new() { Tag.ComesAfterMinesXl },
                "NecropolisOne" => new() { Tag.ComesAfterNecropolisOne },
                "NecropolisTwo" => new() { Tag.ComesAfterNecropolisTwo },
                "NecropolisXL" => new() { Tag.ComesAfterNecropolisXl },
                "ScarredWombOne" => new() { Tag.ComesAfterScarredWombOne },
                "ScarredWombTwo" => new() { Tag.ComesAfterScarredWombTwo },
                "ScarredWombXL" => new() { Tag.ComesAfterScarredWombXl },
                "Sheol" => new() { Tag.ComesAfterSheol },
                "TheVoid" => new() { Tag.ComesAfterTheVoid },
                "UteroOne" => new() { Tag.ComesAfterUteroOne },
                "UteroTwo" => new() { Tag.ComesAfterUteroTwo },
                "UteroXL" => new() { Tag.ComesAfterUteroXl },
                "WombOne" => new() { Tag.ComesAfterWombOne },
                "WombTwo" => new() { Tag.ComesAfterWombTwo },
                "WombXL" => new() { Tag.ComesAfterWombXl },
                "BurningBasementOne" => new() { Tag.ComesAfterBurningBasementOne },
                "BurningBasementTwo" => new() { Tag.ComesAfterBurningBasementTwo },
                "BurningBasementXL" => new() { Tag.ComesAfterBurningBasementXl },
                _ => new()
            };

            if (requiredTags.Count is 0)
            {
                return new();
            }

            return await _isaacRepository.GetResources(new()
            {
                RequiredTags = requiredTags,
                ResourceType = ResourceType.Floor,
                OrderBy1 = ResourceOrderBy.DisplayOrder
            });
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

        [HttpGet("transformation-items/{id}")]
        public async Task<List<TransformativeIsaacResource>> GetTransformationitems(string id)
        {
            var items = await _isaacRepository.GetTransformationItems(id);
            return items;
        }
    }
}


