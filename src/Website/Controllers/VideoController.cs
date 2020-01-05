using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Route("Api/Videos")]
    public class VideoController : Controller
    {
        public const string Controllername = "Video";

        private readonly IVideoRepository _videoRepository;

        public VideoController(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        [HttpGet("Title/{videoId}")]
        public async Task<ActionResult<string>> GetVideoTitle([FromRoute] string videoId)
        {
            var searchResult = await _videoRepository.GetVideoTitle(videoId);

            if (!string.IsNullOrEmpty(searchResult))
            {
                return Ok(searchResult);
            }
            else
            {
                return NotFound();
            }
        }
    }
}
