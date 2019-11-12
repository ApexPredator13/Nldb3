using Google.Apis.YouTube.v3.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Admin;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Authorize("admin"), Route("Admin")]
    public class AdminController : Controller
    {
        private readonly IVideoRepository _videoRepository;

        public AdminController(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        [HttpPost("save_or_update_videos")]
        public async Task<OkResult> AddOrUpdate(SaveVideo model)
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
    }
}
