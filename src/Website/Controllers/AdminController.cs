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
        private readonly IIsaacRepository _isaacRepository;
        private readonly IIsaacIconManager _iconManager;

        public AdminController(IVideoRepository videoRepository, IModRepository modRepository, IIsaacRepository isaacRepository, IIsaacIconManager iconManager)
        {
            _videoRepository = videoRepository;
            _modRepository = modRepository;
            _isaacRepository = isaacRepository;
            _iconManager = iconManager;
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
            await _modRepository.SaveMod(model);
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

        [HttpPost("create_mod_link")]
        public async Task<ActionResult> CreateLink([FromForm] CreateModLink model)
        {
            var result = await _modRepository.AddModUrl(model);
            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Link could not be created");
            }
        }

        [HttpPost("delete_isaac_resource")]
        public async Task<ActionResult> DeleteIsaacResource([FromForm] string resourceId)
        {
            var resource = await _isaacRepository.GetResourceById(resourceId, false);

            if (resource is null)
            {
                return NotFound();
            }

            _iconManager.ClearRectangle(resource.X, resource.Y, resource.W, resource.H);

            var result = await _isaacRepository.DeleteResource(resourceId);
            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("resource was not deleted");
            }
        }

        [HttpPost("change_resource_name")]
        public async Task<ActionResult> ChangeResourceName([FromForm] ChangeName model)
        {
            var result = await _isaacRepository.UpdateName(model.ResourceId, model.NewName);
            
            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost("change_icon")]
        public async Task<ActionResult> ChangeResourceIcon([FromForm] ChangeIcon model)
        {
            var resource = await _isaacRepository.GetResourceById(model.ResourceId, false);

            if (resource is null)
            {
                return NotFound();
            }

            _iconManager.ClearRectangle(resource.X, resource.Y, resource.W, resource.H);
            var (w, h) = await _iconManager.GetPostedImageSize(model.NewIcon!);
            var (x, y) = await _iconManager.FindEmptySquare(w, h);
            var (iconWidth, iconHeight) = _iconManager.EmbedIcon(model.NewIcon!, x, y);

            await _isaacRepository.UpdateIconCoordinates(model.ResourceId, x, y, iconWidth, iconHeight);
            return Ok();
        }

        [HttpPost("change_exists_in")]
        public async Task<ActionResult> ChangeExistsIn([FromForm] ChangeExistsIn model)
        {
            var result = await _isaacRepository.UpdateExistsIn(model.ResourceId, model.NewExistsIn);

            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("value could not be changed");
            }
        }

        [HttpPost("change_mod")]
        public async Task<ActionResult> ChangeMod([FromForm] ChangeMod model)
        {
            var dbChanges = await _isaacRepository.UpdateMod(model);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Mod could not be changed");
            }
        }

        [HttpPost("change_color")]
        public async Task<ActionResult> ChangeColor([FromForm] ChangeColor model)
        {
            var result = await _isaacRepository.UpdateColor(model);

            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Color could not be changed.");
            }
        }

        [HttpPost("create_resource")]
        public async Task<ActionResult> CreateResource([FromForm] CreateIsaacResource model)
        {
            if (model.Icon is null)
            {
                return BadRequest("no icon!");
            }

            var (width, height) = await _iconManager.GetPostedImageSize(model.Icon);
            var (x, y) = await _iconManager.FindEmptySquare(width, height);
            var (embeddedIconWidth, embeddedIconHeight) = _iconManager.EmbedIcon(model.Icon, x, y);
            var result = await _isaacRepository.SaveResource(model, x, y, embeddedIconWidth, embeddedIconHeight);

            return Ok(result);
        }

        [HttpPost("change_tags")]
        public async Task<ActionResult> ChangeTags([FromForm] ChangeTags model)
        {
            await _isaacRepository.ClearTags(model.ResourceId);
            int dbChanges = 0;

            foreach (var tag in model.Tags)
            {
                dbChanges += await _isaacRepository.AddTag(model.ResourceId, tag);
            }
           
            if (dbChanges > 0)
            {
                return Ok();
            } 
            else
            {
                return BadRequest("No tags were added");
            }
        }

        [HttpPost("change_display_order")]
        public async Task<ActionResult> ChangeDisplayOrder([FromForm] ChangeDisplayOrder model)
        {
            var result = await _isaacRepository.ChangeDisplayOrder(model);
            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("display order was not updated successfully");
            }
        }
    }
}
