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
        private readonly IBarGraphCreator _barGraphCreator;

        public ResourceController(IIsaacRepository isaacRepository, IBarGraphCreator barGraphCreator)
        {
            _isaacRepository = isaacRepository;
            _barGraphCreator = barGraphCreator;
        }

        [HttpGet]
        public async Task<ActionResult> Index([FromRoute] string id, IsaacResourceSearchOptions searchOptions)
        {
            var item = await _isaacRepository.GetResourceById(id, true);
            return View(item);
        }
    }
}


