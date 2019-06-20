using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models;
using Website.Services;

namespace Website.Controllers
{
    public class VideosController : Controller
    {
        public const string Controllername = "Videos";

        private readonly IVideoRepository _videoRepository;

        public VideosController(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        public async Task<ViewResult> Index([FromQuery] GetVideos? request = null)
        {
            if (request is null)
            {
                request = new GetVideos();
            }

            var videos = await _videoRepository.GetVideos(request);
            return View(videos);
        }
    }
}
