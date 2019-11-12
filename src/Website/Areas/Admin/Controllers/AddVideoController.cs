using Google.Apis.YouTube.v3.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Services;

namespace Website.Areas.Admin.Controllers
{
    [Authorize("admin"), Area("Admin")]
    public class AddVideosController : Controller
    {
        public const string Controllername = "AddVideos";

        private readonly IVideoRepository _videoRepository;

        public AddVideosController(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        [HttpGet]
        public ViewResult VideosSaved([FromQuery] string videoIds) => View(nameof(VideosSaved), videoIds);
    }
}
