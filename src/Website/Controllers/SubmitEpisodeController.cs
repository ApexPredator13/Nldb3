using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Website.Areas.Api.Models;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Controllers
{
    [Authorize]
    public class SubmitEpisodeController : Controller
    {
        public const string Controllername = "SubmitEpisode";

        private readonly IIsaacRepository _isaacRepository;
        private readonly IVideoRepository _videoRepository;
        private readonly UserManager<IdentityUser> _userManager;

        public SubmitEpisodeController(IIsaacRepository isaacRepository, IVideoRepository videoRepository, UserManager<IdentityUser> userManager)
        {
            _isaacRepository = isaacRepository;
            _videoRepository = videoRepository;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ViewResult> Index(string id)
        {
            ViewData["Id"] = id;
            var request = new GetResource() { ResourceType = ResourceType.Unspecified };
            var items = await _isaacRepository.GetResources(request);
            return View(items);
        }

        [HttpPost, Authorize]
        public async Task<ActionResult> Index([FromBody] SubmittedCompleteEpisode episode)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.Values.First().Errors.First().ErrorMessage);
            }

            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                return BadRequest("User was not found or is not logged in.");
            }

            try
            {
                await _videoRepository.SubmitEpisode(episode, user.Id, SubmissionType.New);
            }
            catch(Exception)
            {
                return BadRequest("Error while writing the submitted episode to the database");
            }

            return Ok();
        }
    }
}
