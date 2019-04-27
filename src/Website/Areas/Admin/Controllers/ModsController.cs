using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Models.Database;
using Website.Services;

namespace Website.Areas.Admin.Controllers
{
    [Authorize("admin"), Area("Admin")]
    public class ModsController : Controller
    {
        public const string Controllername = "Mods";

        private readonly IModRepository _modRepository;

        public ModsController(IModRepository modRepository)
        {
            _modRepository = modRepository;
        }

        [HttpGet]
        public async Task<ViewResult> Index()
        {
            var mods = await _modRepository.GetAllMods();
            return View(mods);
        }

        [HttpGet]
        public ViewResult CreateMod() => View(new CreateMod());

        [HttpPost]
        public async Task<ActionResult> CreateMod([FromForm] CreateMod model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var modId = await _modRepository.SaveMod(model);

            return RedirectToAction(nameof(Mod), new { modId });
        }

        [HttpGet]
        public async Task<ViewResult> Mod([FromQuery] int modId)
        {
            Mod? mod = await _modRepository.GetModById(modId);
            return View(mod);
        }

        [HttpGet]
        public ViewResult CreateLink([FromQuery] int modId) => View(new CreateModLink { ModId = modId });

        [HttpPost]
        public async Task<ActionResult> CreateLink([FromForm] CreateModLink model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            await _modRepository.AddModUrl(model);
            return RedirectToAction(nameof(Mod), new { modId = model.ModId });
        }

        [HttpPost]
        public async Task<ActionResult> DeleteLink([FromForm] DeleteModLink model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            await _modRepository.RemoveModUrl(model.LinkId);
            return RedirectToAction(nameof(Mod), new { model.ModId });
        }

        [HttpPost]
        public async Task<ActionResult> DeleteMod([FromForm] DeleteMod model)
        {
            if (!ModelState.IsValid)
            {
                return View(nameof(Index), await _modRepository.GetAllMods());
            }

            await _modRepository.RemoveMod(model.ModId);
            return RedirectToAction(nameof(Index));
        }
    }
}
