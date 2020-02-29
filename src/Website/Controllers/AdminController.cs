using Google.Apis.YouTube.v3.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Admin;
using Website.Models.Database;
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
        private readonly IEditSubmissionRepository _editSubmissionRepository;
        private readonly IEmailService _emailService;

        public AdminController(IVideoRepository videoRepository, IModRepository modRepository, IIsaacRepository isaacRepository, IIsaacIconManager iconManager, IEditSubmissionRepository editSubmissionRepository, IEmailService emailService)
        {
            _videoRepository = videoRepository;
            _modRepository = modRepository;
            _isaacRepository = isaacRepository;
            _iconManager = iconManager;
            _editSubmissionRepository = editSubmissionRepository;
            _emailService = emailService;
        }

        [HttpPost("email_test")]
        public async Task<ActionResult> EmailTest([FromForm] EmailTest model)
        {
            try
            {
                await _emailService.SendEmailAsync(model.To, model.Subject, model.HtmlMessage);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return Ok();
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
        public async Task<ActionResult> ChangeTags([FromBody] ChangeTags model)
        {
            int deleteChanges = await _isaacRepository.ClearTags(model.ResourceId);

            int dbChanges = 0;

            foreach (var tag in model.Tags)
            {
                dbChanges += await _isaacRepository.AddTag(model.ResourceId, tag);
            }
           
            if (dbChanges != 0 || deleteChanges != 0)
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

        [HttpPost("change_game_mode")]
        public async Task<ActionResult> ChangeGameMode([FromForm] ChangeGameMode model)
        {
            var result = await _isaacRepository.UpdateGameMode(model.ResourceId, model.NewGameMode);
            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("game mode was not updated successfully");
            }
        }

        [HttpGet("Submissions/{limit:int}/{offset:int}")]
        public async Task<List<AdminSubmission>> ViewSubmissions([FromRoute] int limit, [FromRoute] int offset)
        {
            return await _videoRepository.GetSubmissions(limit, offset);
        }

        [HttpGet("Submissions/{videoId}/{submissionId:int}/Events")]
        public async Task<List<GameplayEvent>> GetGameplayEventsForSubmission([FromRoute] string videoId, [FromRoute] int submissionId)
        {
            return await _isaacRepository.GetGameplayEventsForVideo(videoId, submissionId);
        }

        [HttpGet("Submissions/{videoId}/{submissionId:int}/Floors")]
        public async Task<List<PlayedFloor>> GetFloorsForSubmission([FromRoute] string videoId, [FromRoute] int submissionId)
        {
            return await _isaacRepository.GetFloorsForVideo(videoId, submissionId);
        }

        [HttpGet("Submissions/{videoId}/{submissionId:int}/Characters")]
        public async Task<List<PlayedCharacter>> GetPlayedCharactersForSubmission([FromRoute] string videoId, [FromRoute] int submissionId)
        {
            return await _isaacRepository.GetPlayedCharactersForVideo(videoId, submissionId);
        }

        [HttpGet("PlayedCharacter/{playedCharacterId:int}")]
        public async Task<ActionResult<PlayedCharacter>> GetPlayedCharacterById([FromRoute] int playedCharacterId)
        {
            var character = await _isaacRepository.GetPlayedCharacterById(playedCharacterId);

            if (character is null)
            {
                return NotFound();
            }
            else
            {
                return character;
            }
        }

        [HttpGet("PlayedFloor/{playedFloorId:int}")]
        public async Task<ActionResult<PlayedFloor>> GetPlayedFloorById([FromRoute] int playedFloorId)
        {
            var floor = await _isaacRepository.GetPlayedFloorById(playedFloorId);

            if (floor is null)
            {
                return NotFound();
            }
            else
            {
                return floor;
            }
        }

        [HttpGet("GameplayEvent/{gameplayEventId:int}")]
        public async Task<ActionResult<GameplayEvent>> GetGameplayEventById([FromRoute] int gameplayEventId)
        {
            var gameplayEvent = await _isaacRepository.GetGameplayEventById(gameplayEventId);

            if (gameplayEvent is null)
            {
                return NotFound();
            }
            else
            {
                return gameplayEvent;
            }
        }

        [HttpPost("update_gameplay_event_type")]
        public async Task<ActionResult> UpdateGameplayEventType([FromForm] UpdateGameplayEventType updateGameplayEventType)
        {
            var dbChanges = await _editSubmissionRepository.UpdateGameplayEventType(updateGameplayEventType);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("The event type was not updated successfully");
            }
        }

        [HttpPost("update_gameplay_event_player")]
        public async Task<ActionResult> UpdateGameplayEventPlayer([FromForm] UpdateGameplayEventPlayer updateGameplayEventPlayer)
        {
            var dbChanges = await _editSubmissionRepository.UpdateGameplayEventPlayer(updateGameplayEventPlayer);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Player was not updated successfully");
            }
        }

        [HttpPost("update_gameplay_event_rerolled")]
        public async Task<ActionResult> UpdateGameplayEventRerolled([FromForm] UpdateGameplayEventWasRerolled updateGameplayEventRerolled)
        {
            var dbChanges = await _editSubmissionRepository.UpdateGameplayEventWasRerolled(updateGameplayEventRerolled);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Player was not updated successfully");
            }
        }

        [HttpPost("insert_gameplay_event")]
        public async Task<ActionResult> InsertGameplayEvent([FromForm] InsertGameplayEvent insert)
        {
            var dbChanges = await _editSubmissionRepository.InsertGameplayEventAfterEvent(insert);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Event could not be inserted");
            }
        }

        [HttpPost("delete_gameplay_event")]
        public async Task<ActionResult> DeleteGameplayEvent([FromForm] DeleteGameplayEvent delete)
        {
            var dbChanges = await _editSubmissionRepository.DeleteGameplayEvent(delete);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Event could not be deleted");
            }
        }

        [HttpPost("delete_submission")]
        public async Task<ActionResult> DeleteSubmission([FromForm] DeleteSubmission deleteSubmission)
        {
            var dbChanges = await _editSubmissionRepository.DeleteSubmission(deleteSubmission.SubmissionId);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Submission was not deleted");
            }
        }
    }
}
