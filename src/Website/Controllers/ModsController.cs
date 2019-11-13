using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Route("Api/Mods")]
    public class ModsController : Controller
    {
        private readonly IModRepository _modRepository;

        public ModsController(IModRepository modRepository)
        {
            _modRepository = modRepository;
        }

        [HttpGet]
        public async Task<List<Mod>> GetAllMods()
        {
            return await _modRepository.GetAllMods();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Mod>> GetMod([FromRoute] int id)
        {
            var mod = await _modRepository.GetModById(id);

            if (mod is null)
            {
                return NotFound();
            }
            else
            {
                return mod;
            }
        }
    }
}



