using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Infrastructure;
using Website.Models;
using Website.Models.Database.Enums;
using Website.Models.Resource;
using Website.Services;

namespace Website.Controllers
{
    public class ResourceController : Controller
    {
        public const string Controllername = "Resource";

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
            var item = await _isaacRepository.GetResourceById(id, true);
            searchOptions.ResourceType = item.ResourceType;
            var videos = await _videoRepository.GetVideos(searchOptions);
            return View(new InitialResourceViewModel(item, videos));
        }
    }
}


