using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Services;

namespace Website.Areas.Admin.Controllers
{
    [Area("admin")]
    public class SubmissionsController : Controller
    {
        public const string Controllername = "Submissions";

        private readonly IIsaacRepository _isaacRepository;

        public SubmissionsController(IIsaacRepository isaacRepository)
        {
            _isaacRepository = isaacRepository;
        }

        [HttpGet]
        public ViewResult Index() => View();

        [HttpGet]
        public async Task<ViewResult> ViewSubmissions([FromRoute] string id)
        {
            var submissions = await _isaacRepository.GetSubmittedEpisodesForVideo(id);
            return View(submissions);
        }

        [HttpGet("EditSubmission/{videoId}/{id}")]
        public async Task<ViewResult> EditSubmission([FromRoute] string videoId, [FromRoute] int id)
        {
            var submission = await _isaacRepository.GetSubmittedEpisodesForVideo(videoId, id);
            return View(submission);
        }

        [HttpGet("DeleteSubmission/{videoId}/{id}")]
        public ViewResult DeleteSubmission([FromRoute] string videoId, [FromRoute] int id) => View((videoId, id));

        [HttpPost]
        public async Task<RedirectToActionResult> ConfirmDeleteSubmission([FromForm] int id, [FromForm] string videoId)
        {
            await _isaacRepository.DeleteSubmission(id);
            return RedirectToAction(nameof(ViewSubmissions), new { id = videoId });
        }
    }
}
