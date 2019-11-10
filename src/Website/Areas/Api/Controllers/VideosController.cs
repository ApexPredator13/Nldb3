using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models;
using Website.Models.Database;
using Website.Services;

namespace Website.Areas.Api.Controllers
{
    [ApiController, Route("api/videos")]
    public class VideosController : Controller
    {
        private readonly IVideoRepository _videoRepository;

        public VideosController(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        [HttpGet]
        public async Task<NldbVideoResult> GetVideos([FromQuery] IsaacSearchOptions? request = null)
        {
            if (request is null)
            {
                request = new IsaacSearchOptions();
            }

            return await _videoRepository.GetVideos(request);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NldbVideo>> GetVideo([FromRoute] string id)
        {
            var video = await _videoRepository.GetCompleteEpisode(id);
            
            if (video is null)
            {
                return NotFound();
            }
            else
            {
                return video;
            }
        }
    }
}
