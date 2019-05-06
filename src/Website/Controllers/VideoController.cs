using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Website.Services;

namespace Website.Controllers
{
    public class VideoController : Controller
    {
        public const string Controllername = "Video";

        private readonly IVideoRepository _videoRepository;

        public VideoController(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        public async Task<ViewResult> Index([FromRoute] string id)
        {
            var video = await _videoRepository.GetCompleteEpisode(id);
            return View(video);
        }
    }
}
