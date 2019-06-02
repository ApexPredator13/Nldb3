using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Areas.Api.Models;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Controllers
{
    public class SubmitEpisodeController : Controller
    {
        public const string Controllername = "SubmitEpisode";

        private readonly IIsaacRepository _isaacRepository;

        public SubmitEpisodeController(IIsaacRepository isaacRepository)
        {
            _isaacRepository = isaacRepository;
        }

        public async Task<ViewResult> Index(string id)
        {
            ViewData["Id"] = id;
            var request = new GetResource() { ResourceType = ResourceType.Unspecified };
            var items = await _isaacRepository.GetResources(request);
            return View(items);
        }
    }
}
