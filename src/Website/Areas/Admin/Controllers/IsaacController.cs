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
        private readonly IIsaacIconManager _iconManager;
        private readonly IModRepository _modRepository;

        public IsaacController(IIsaacRepository isaacRepository, IIsaacIconManager iconManager, IModRepository modRepository)
        {
            _isaacRepository = isaacRepository;
            _iconManager = iconManager;
            _modRepository = modRepository;
        }

        [HttpGet]
        public ViewResult Index([FromQuery] string? message = null) => View(nameof(Index), message);

        [HttpGet]
        public async Task<ViewResult> Details([FromRoute] string id)
        {
            var resource = await _isaacRepository.GetResourceById(id, true);
            return View(resource);
        }

        [HttpGet]
        public async Task<ActionResult> ChangeName([FromRoute] string id)
        {
            var resource = await _isaacRepository.GetResourceById(id, false);

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
            var resouce = await _isaacRepository.GetResourceById(id, false);

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

        [HttpGet]
        public async Task<ViewResult> Create()
        {
            ViewData["Mods"] = await _modRepository.GetAllMods();
            return View(new CreateIsaacResource());
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromForm] CreateIsaacResource model)
        {
            if (!ModelState.IsValid)
            {
                ViewData["Mods"] = await _modRepository.GetAllMods();
                return View(model);
            }

            var icon = model.Icon!;

            var (w, h) = await _iconManager.GetPostedImageSize(icon);
            var (x, y) = await _iconManager.FindEmptySquare(w, h);
            _iconManager.EmbedIcon(icon, x, y);

            var id = await _isaacRepository.SaveResource(model, x, y, w, h);

            return RedirectToAction(nameof(Details), new { id });
        }

        [HttpGet]
        public ViewResult ChangeIcon([FromRoute] string id) => View(new ChangeIcon() { ResourceId = id });

        [HttpPost]
        public async Task<ActionResult> ChangeIcon(ChangeIcon model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var resource = await _isaacRepository.GetResourceById(model.ResourceId, false);

            if (resource is null)
            {
                return RedirectToAction(nameof(Index), new { message = $"The isaac resource with id '{model.ResourceId}' was not found!" });
            }

            _iconManager.ClearRectangle(resource.X, resource.Y, resource.W, resource.H);
            var (w, h) = await _iconManager.GetPostedImageSize(model.NewIcon!);
            var (x, y) = await _iconManager.FindEmptySquare(w, h);
            var (iconWidth, iconHeight) = _iconManager.EmbedIcon(model.NewIcon!, x, y);

            await _isaacRepository.UpdateIconCoordinates(model.ResourceId, x, y, iconWidth, iconHeight);
            return RedirectToAction(nameof(Details), new { id = model.ResourceId });
        }

        [HttpGet]
        public ViewResult ChangeExistsIn([FromRoute] string id) => View(new ChangeExistsIn() { ResourceId = id });

        [HttpPost]
        public async Task<ActionResult> ChangeExistsIn(ChangeExistsIn model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            int result = await _isaacRepository.UpdateExistsIn(model.ResourceId, model.NewExistsIn);

            if (result > 0)
            {
                return RedirectToAction(nameof(Details), new { id = model.ResourceId });
            }
            else
            {
                return RedirectToAction(nameof(Index), new { message = $"could not update 'exists in' value for item with id '{model.ResourceId}'" });
            }
        }

        [HttpGet]
        public ViewResult ChangeGameMode([FromRoute] string id) => View(new ChangeGameMode() { ResourceId = id });

        [HttpPost]
        public async Task<ActionResult> ChangeGameMode(ChangeGameMode model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            int result = await _isaacRepository.UpdateGameMode(model.ResourceId, model.NewGameMode);

            if (result > 0)
            {
                return RedirectToAction(nameof(Details), new { id = model.ResourceId });
            }
            else
            {
                return RedirectToAction(nameof(Index), new { message = $"could not update game mode value for item with id '{model.ResourceId}'" });
            }
        }
    }
}
