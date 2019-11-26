using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Areas.Api.Models;
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
        public static readonly Dictionary<string, ResourceType> OverviewPageNames = new Dictionary<string, ResourceType>() {
            { "bosses", ResourceType.Boss },
            { "items", ResourceType.Item},
            { "itemsources", ResourceType.ItemSource},
            { "characters", ResourceType.Character},
            { "curses", ResourceType.Curse},
            { "other", ResourceType.OtherEvent},
            { "floors", ResourceType.Floor},
            { "pills", ResourceType.Pill},
            { "runes", ResourceType.Rune},
            { "tarotcards", ResourceType.TarotCard},
            { "tarot_cards", ResourceType.TarotCard},
            { "enemies", ResourceType.Enemy},
            { "transformations", ResourceType.Transformation},
            { "trinkets", ResourceType.Trinket},
            { "rerolls", ResourceType.CharacterReroll},
            { "characterrerolls", ResourceType.CharacterReroll},
            { "character_rerolls", ResourceType.CharacterReroll},
            { "otherconsumables", ResourceType.OtherConsumable},
            { "other_consumables", ResourceType.OtherConsumable},
        };

        private readonly IIsaacRepository _isaacRepository;
        private readonly IVideoRepository _videoRepository;

        public ResourceController(IIsaacRepository isaacRepository, IVideoRepository videoRepository)
        {
            _isaacRepository = isaacRepository;
            _videoRepository = videoRepository;
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
            if (Enum.TryParse(typeof(Tag), $"ComesAfter{currentFloorId}", out object? tag))
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

        //[HttpGet]
        //public async Task<ActionResult> Index([FromRoute] string id, IsaacSearchOptions searchOptions)
        //{
        //    searchOptions.ResourceId = id;
        //    var resource = await _isaacRepository.GetResourceById(id, true);
        //    if (!(resource is null))
        //    {
        //        var availableResources = _isaacRepository.GetAvailableStats(resource);
        //        searchOptions.ResourceType = resource.ResourceType;
        //        var videos = await _videoRepository.GetVideos(searchOptions);
        //        videos.Header = $"Videos where '{resource.Name}' appears";
        //        return View(new InitialResourceViewModel(resource, videos, availableResources));
        //    }
        //    else
        //    {
        //        return NotFound();
        //    }
        //}

        //[HttpGet("Overview")]
        //public async Task<ViewResult> Overview([FromRoute] string id)
        //{
        //    var getResourcesOptions = new GetResource()
        //    {
        //        IncludeMod = true,
        //        OrderBy1 = ResourceOrderBy.Name,
        //        ResourceType = OverviewPageNames[id.ToLower()]
        //    };

        //    var resources = await _isaacRepository.GetResources(getResourcesOptions);

        //    var sortedResources = new Dictionary<string, List<IsaacResource>>();

        //    foreach (var resource in resources)
        //    {
        //        var firstChar = resource.Name[0];
        //        var key = char.IsLetter(firstChar) ? firstChar.ToString() : "Other";

        //        if (!sortedResources.ContainsKey(key))
        //        {
        //            sortedResources.Add(key, new List<IsaacResource>());
        //        }
        //        sortedResources[key].Add(resource);
        //    }

        //    return View(getResourcesOptions.ResourceType);
        //}
    }
}


