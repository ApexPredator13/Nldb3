using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Areas.Api.Models;
using Website.Models;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Resource;
using Website.Services;

namespace Website.Controllers
{
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

        [HttpGet]
        public async Task<ActionResult> Index([FromRoute] string id, IsaacSearchOptions searchOptions)
        {
            searchOptions.ResourceId = id;
            var resource = await _isaacRepository.GetResourceById(id, true);
            var availableResources = _isaacRepository.GetAvailableStats(resource);
            searchOptions.ResourceType = resource.ResourceType;
            var videos = await _videoRepository.GetVideos(searchOptions);
            return View(new InitialResourceViewModel(resource, videos, availableResources));
        }

        [HttpGet]
        public async Task<ViewResult> Overview([FromRoute] string id)
        {
            var request = new GetResource()
            {
                IncludeMod = true,
                OrderBy1 = ResourceOrderBy.Name,
                ResourceType = OverviewPageNames[id.ToLower()]
            };

            var resources = await _isaacRepository.GetResources(request);

            var sortedResources = new Dictionary<string, List<IsaacResource>>();

            foreach (var resource in resources)
            {
                var firstChar = resource.Name[0];
                var key = char.IsLetter(firstChar) ? firstChar.ToString() : "Other";

                if (!sortedResources.ContainsKey(key))
                {
                    sortedResources.Add(key, new List<IsaacResource>());
                }
                sortedResources[key].Add(resource);
            }

            var model = new IsaacResourceOverview(sortedResources, OverviewPageNames[id.ToLower()]);
            return View(model);
        }
    }
}


