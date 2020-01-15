using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models;
using Website.Models.Database;
using Website.Models.Resource;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Route("Api/Videos")]
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

        [HttpGet("{videoId}/Contributors")]
        public async Task<List<VideoContributor>> GetContributors([FromRoute] string videoId)
        {
            return await _videoRepository.GetContributorsForVideo(videoId);
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

        [HttpGet("max")]
        public async Task<MaxVideoStats> GetMaxVideoStats()
        {
            return await _videoRepository.GetMaxVideoStats();
        }
    }
}


