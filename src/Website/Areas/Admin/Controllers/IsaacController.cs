using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Website.Areas.Admin.ViewModels;
using Website.Services;

namespace Website.Areas.Admin.Controllers
{
    [Authorize("admin"), Area("Admin")]
    public class IsaacController : Controller
    {
        public const string Controllername = "Isaac";

        private readonly IIsaacRepository _isaacRepository;

        public IsaacController(IIsaacRepository isaacRepository)
        {
            _isaacRepository = isaacRepository;
        }

        [HttpGet]
        public ViewResult Index([FromQuery] string? message = null) => View(nameof(Index), message);

        [HttpGet]
        public async Task<ViewResult> Details([FromRoute] string id)
        {
            var resource = await _isaacRepository.GetResourceById(id, true, true);
            return View(resource);
        }

        [HttpGet]
        public async Task<ActionResult> ChangeName([FromRoute] string id)
        {
            var resource = await _isaacRepository.GetResourceById(id, false, false);

            if (resource is null)
            {
                return RedirectToAction(nameof(Index), new { message = $"The object with id '{id}' was not found!" });
            }

            ViewData["CurrentName"] = resource.Name;
            return View(new ChangeName() { ResourceId = id });
        }

        [HttpPost]
        public async Task<ActionResult> ChangeName([FromForm] ChangeName model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var result = await _isaacRepository.UpdateName(model.ResourceId, model.NewName);

            if (result > 0)
            {
                return RedirectToAction(nameof(Details), Controllername, new { id = model.ResourceId });
            }
            else
            {
                return RedirectToAction(nameof(Index), new { message = "The item name could not be changed!" });
            }
        }

        [HttpGet]
        public async Task<ActionResult> ChangeId([FromRoute] string id)
        {
            var resouce = await _isaacRepository.GetResourceById(id, false, false);

            if (resouce is null)
            {
                return RedirectToAction(nameof(Index), new { message = $"The object with id '{id}' was not found!" });
            }

            return View(new ChangeId() { CurrentId = id });
        }

        [HttpPost]
        public async Task<ActionResult> ChangeId([FromForm] ChangeId model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var result = await _isaacRepository.UpdateId(model.CurrentId, model.NewId);

            if (result > 0)
            {
                return RedirectToAction(nameof(Details), Controllername, new { id = model.CurrentId });
            }
            else
            {
                return RedirectToAction(nameof(Index), new { message = "The item ID could not be changed!" });
            }
        }
    }
}
