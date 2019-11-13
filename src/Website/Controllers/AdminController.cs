using Google.Apis.YouTube.v3.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Admin;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Authorize("admin"), Route("Admin")]
    public class AdminController : Controller
    {
        private readonly IVideoRepository _videoRepository;
        private readonly IModRepository _modRepository;

        public AdminController(IVideoRepository videoRepository, IModRepository modRepository)
        {
            _videoRepository = videoRepository;
            _modRepository = modRepository;
        }

        [HttpPost("save_or_update_videos")]
        public async Task<OkResult> AddOrUpdate([FromForm] SaveVideo model)
        {
            var videoData = await _videoRepository.GetYoutubeVideoData(model.VideoIds.Split(','));

            foreach (var data in videoData.Items)
            {
                if (await _videoRepository.VideoExists(data.Id))
                {
                    await _videoRepository.UpdateVideosWithYoutubeData(new List<Video>() { data });
                }
                else
                {
                    await _videoRepository.SaveVideo(data);
                }

                await _videoRepository.SetThumbnails(data.Snippet.Thumbnails, data.Id);
            }

            return Ok();
        }

        [HttpPost("delete_mod")]
        public async Task<ActionResult> DeleteMod([FromForm] DeleteMod model)
        {
            var result = await _modRepository.RemoveMod(model.ModId);

            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Mod was not deleted");
            }
        }

        [HttpPost("create_mod")]
        public async Task<OkResult> CreateMod([FromForm] CreateMod model)
        {
            var modId = await _modRepository.SaveMod(model);
            return Ok();
        }

        [HttpPost("delete_mod_link")]
        public async Task<ActionResult> DeleteModLink([FromForm] DeleteModLink model)
        {
            var result = await _modRepository.RemoveModUrl(model.LinkId);

            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Mod Link could not be deleted");
            }
        }
    }
}
