using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Areas.Api.Models;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Services;
using Website.Models.SubmitEpisode;

namespace Website.Areas.Api.Controllers
{
    [ApiController, Area("api"), Route("[area]/resources")]
    public class ResourceController : Controller
    {
        private readonly IIsaacRepository _isaacRepository;

        public ResourceController(IIsaacRepository isaacRepository)
        {
            _isaacRepository = isaacRepository;
        }

        [HttpPost("history")]
        public async Task<History> GetHistory([FromBody] SubmittedCompleteEpisode episode)
        {
            var history = await _isaacRepository.GetHistory(episode);
            return history;
        }

        [HttpGet("{id}")]
        public async Task<IsaacResource?> Index(string id, bool includeMod = false)
        {
            return await _isaacRepository.GetResourceById(id, includeMod);
        }

        [HttpGet]
        public async Task<List<IsaacResource>> Index([FromQuery] GetResource resource)
        {
            return await _isaacRepository.GetResources(resource);
        }

        [HttpGet("effect")]
        public List<int> GetEffectNumber([FromQuery] params string[] name)
        {
            var result = new List<int>();
            var enumType = typeof(Effect);
            var effectNames = Enum.GetNames(enumType);

            foreach (var n in name)
            {
                string? exists = effectNames.FirstOrDefault(x => x.ToLower().IndexOf(n.ToLower()) != -1);

                if (exists != null)
                {
                    try
                    {
                        var enumValue = Convert.ToInt32((Effect)Enum.Parse(enumType, exists));
                        result.Add(enumValue);
                    }
                    catch
                    {
                        Console.WriteLine("failed to parse enum value");
                    }
                }
            }

            return result;
        }

        [HttpGet("next-floorset/{id}")]
        public async Task<List<IsaacResource>> GetNextFloorset([FromRoute] string id)
        {
            if (Enum.TryParse(typeof(Effect), $"ComesAfter{id}", out object effect))
            {
                var foundEffect = (Effect)effect;
                return await _isaacRepository.GetResources(new GetResource()
                {
                    RequiredTags = new List<Effect> { foundEffect },
                    ResourceType = ResourceType.Floor
                });
            }
            else
            {
                return new List<IsaacResource>();
            }
        }
    }
}
