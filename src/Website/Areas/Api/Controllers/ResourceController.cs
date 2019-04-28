using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Models.Database;
using Website.Models.Validation;
using Website.Services;

namespace Website.Areas.Api.Controllers
{
    [ApiController, Route("api/resources")]
    public class ResourceController : Controller
    {
        private readonly IIsaacRepository _isaacRepository;

        public ResourceController(IIsaacRepository isaacRepository)
        {
            _isaacRepository = isaacRepository;
        }

        [HttpGet("{id}")]
        public async Task<IsaacResource?> Index(string id, bool includeMod = false, bool includeTags = false)
        {
            return await _isaacRepository.GetResourceById(id, includeMod, includeTags);
        }

        [HttpGet]
        public async Task<List<IsaacResource>> Index([FromQuery] GetResource resource)
        {
            return await _isaacRepository.GetResources(resource);
        }
    }
}
