using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        public ViewResult Index() => View(new SaveVideo());

        [HttpPost]
        public async Task<ActionResult> Index(SaveVideo model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var videoData = await _videoRepository.GetYoutubeVideoData(model.VideoIds.Split(','));

            foreach (var data in videoData.Items)
            {
                if (await _videoRepository.VideoExists(data.Id))
                {
                    await _videoRepository.UpdateVideo(data);
                }
                else
                {
                    await _videoRepository.SaveVideo(data);
                }

                await _videoRepository.SetThumbnails(data.Snippet.Thumbnails, data.Id);
            }

            return RedirectToAction(nameof(VideosSaved), new { videoIds = model.VideoIds });
        }

        [HttpGet]
        public ViewResult VideosSaved([FromQuery] string videoIds) => View(nameof(VideosSaved), videoIds);
    }
}
