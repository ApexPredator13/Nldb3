using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Route("SubmitEpisode")]
    public class SubmitEpisodeController : Controller
    {
        public const string Controllername = "SubmitEpisode";

        private readonly IVideoRepository _videoRepository;
        private readonly UserManager<IdentityUser> _userManager;

        public SubmitEpisodeController(IVideoRepository videoRepository, UserManager<IdentityUser> userManager)
        {
            _videoRepository = videoRepository;
            _userManager = userManager;
        }

        [HttpGet("currently_adding/{id}")]
        public async Task<ActionResult> CurrentlyAdding(string id)
        {
            await _videoRepository.SetVideoIsCurrentlyBeingAdded(id);
            return Ok();
        }

        [HttpPost, Authorize]
        public async Task<ActionResult> SubmitEpisode(SubmittedCompleteEpisode episode)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                return BadRequest("User was not found or is not logged in.");
            }

            await _videoRepository.UpdateVideoWithYoutubeData(episode.VideoId);

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
