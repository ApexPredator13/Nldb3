using Google.Apis.YouTube.v3.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Admin;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
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
        private readonly INpgsql _npgsql;

        public AdminController(
            IVideoRepository videoRepository, 
            IModRepository modRepository, 
            IIsaacRepository isaacRepository, 
            IIsaacIconManager iconManager, 
            IEditSubmissionRepository editSubmissionRepository, 
            IEmailService emailService, 
            INpgsql npgsql)
        {
            _videoRepository = videoRepository;
            _modRepository = modRepository;
            _isaacRepository = isaacRepository;
            _iconManager = iconManager;
            _editSubmissionRepository = editSubmissionRepository;
            _emailService = emailService;
            _npgsql = npgsql;
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

        [HttpGet("Submissions/{limit:int}/{offset:int}/{onlyLatest:bool?}")]
        public async Task<List<AdminSubmission>> ViewSubmissions([FromRoute] int limit, [FromRoute] int offset, [FromRoute] bool? onlyLatest)
        {
            return await _videoRepository.GetSubmissions(limit, offset, onlyLatest ?? false);
        }

        [HttpGet("FindSubmissions/{search}/{limit:int}/{offset:int}")]
        public async Task<List<AdminSubmission>> FindSubmissions([FromRoute] string search, [FromRoute] int limit, [FromRoute] int offset, [FromRoute] bool? onlyLatest)
        {
            return await _videoRepository.FindSubmissions(search, limit, offset);
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

        [HttpPost("update_gameplay_event_resource_two")]
        public async Task<ActionResult> UpdateGameplayEventResourceTwo([FromForm] UpdateGameplayEventResourceTwo updateResourceTwo)
        {
            var dbChanges = await _editSubmissionRepository.UpdateGameplayEventResourceTwo(updateResourceTwo);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Resource Two could not be updated");
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

        [HttpPost("make-transformative")]
        public async Task<ActionResult> MakeTransformative([FromForm] MakeIsaacResourceTransformative model)
        {
            var dbChanges = await _isaacRepository.MakeTransformative(model);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Failed to make resource transformative");
            }
        }

        [HttpPost("make-untransformative/{transformationId}/{isaacResourceId}")]
        public async Task<ActionResult> MakeUntransformative([FromRoute] string transformationId, [FromRoute] string isaacResourceId)
        {
            var dbChanges = await _isaacRepository.MakeUntransformative(transformationId, isaacResourceId);

            if (dbChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Failed to make resource untransformative");
            }
        }

        /// <summary>
        /// will re-write the submission flaggged as 'latest' into a set of temporary tables and compare the output.
        /// if there are differences, it will either return them to the client, or replace the entire submission with the new version.
        /// </summary>
        /// <param name="videoId">the ID of the video whose 'latest' submission should be checked</param>
        /// <param name="fix">
        /// if true, will replace the submission with the recompiled one (if differences can be found). 
        /// if false, nothing will be written to the database and the differences to the original video are returned to the client.
        /// </param>
        /// <returns></returns>
        [HttpPost("recompile/{videoId}/{fix:bool}")]
        public async Task<ActionResult<List<SubmissionDifference>>> RecompileSubmission([FromRoute] string videoId, [FromRoute] bool fix)
        {
            // for simulation purposes, the user ID is not important. Just use the current user.
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

            // load the episode
            var episode = await _videoRepository.GetCompleteEpisode(videoId);

            // recreate the episode as if it was submitted by the javascript front-end
            var submittedEpisode = RecreateSubmission(episode);

            if (submittedEpisode is null)
            {
                return BadRequest("episode invalid");
            }

            // create temp tables
            using var session = await _npgsql.Connect();
            var temporaryTables = new TempTables("tmp_video_submissions", "tmp_played_floors", "tmp_played_characters", "tmp_gameplay_events", "tmp_video_submissions_userdata");
            await ResetTemporaryTableStructure(session, temporaryTables);

            // insert the episode into the temporary tables
            await _videoRepository.SubmitEpisode(submittedEpisode, userId, SubmissionType.New, temporaryTables, session);

            // load the newly inserted episode
            var recompiledEpisode = await _videoRepository.GetCompleteEpisode(videoId, temporaryTables, session);

            // find differences
            var result = CompareSubmissions(episode, recompiledEpisode);



            // if we don't fix the episode now, just return the differences that were found
            if (!fix)
            {
                return Ok(result);
            }

            // if differences exist and we want to fix the episode, replace the entire thing
            else if (fix && result.Any())
            {
                var replaceResult = await ReplaceSubmission(
                    submittedEpisode, 
                    episode?.Submissions.FirstOrDefault(s => s.Latest == true)?.Id ?? -1);

                return replaceResult;
            }

            // if we want to fix, but no differences were found, just leave.
            else
            {
                return BadRequest("'fix' was set to true, but no differences to the original were found");
            }
        }


        private async Task<ActionResult<List<SubmissionDifference>>> ReplaceSubmission(SubmittedCompleteEpisode recreatedSubmission, int submissionId)
        {
            var originalContributorId = await _videoRepository.GetUserIdForSubmission(submissionId);

            if (string.IsNullOrEmpty(originalContributorId))
            {
                return BadRequest("cannot fix the episode: no contributor found");
            }

            await _editSubmissionRepository.DeleteSubmission(submissionId);
            await _videoRepository.SubmitEpisode(recreatedSubmission, originalContributorId, SubmissionType.New);

            return Ok();
        }


        private async Task ResetTemporaryTableStructure(NpgsqlConnection session, TempTables tableNames)
        {
            var videoSubmissions = tableNames.TempVideoSubmissionsTable;
            var playedFloors = tableNames.TempPlayedFloorsTable;
            var playedCharacters = tableNames.TempPlayedCharactersTable;
            var gameplayEvents = tableNames.TempGameplayEventsTable;
            var submissionsUserdata = tableNames.TempVideoSubmissionsUserdataTable;

            var commandText =
                $"DROP TABLE IF EXISTS {gameplayEvents}, {playedFloors}, {playedCharacters}, {submissionsUserdata}, {videoSubmissions} CASCADE; " +

                // temp submissions table
                $"CREATE TEMP TABLE {videoSubmissions} (LIKE video_submissions INCLUDING ALL); " +
                $"ALTER TABLE {videoSubmissions} ALTER id DROP DEFAULT; " +
                $"CREATE TEMP SEQUENCE tmp_video_submissions_sequence; " +
                $"ALTER TABLE {videoSubmissions} ALTER id SET DEFAULT nextval('tmp_video_submissions_sequence'); " +
                $"ALTER SEQUENCE tmp_video_submissions_sequence OWNED BY {videoSubmissions}.id; " +

                // temp submissions_userdata table
                $"CREATE TEMP TABLE {submissionsUserdata} (LIKE video_submissions_userdata INCLUDING ALL); " +
                $"ALTER TABLE {submissionsUserdata} ALTER id DROP DEFAULT; " +
                $"CREATE TEMP SEQUENCE tmp_video_submissions_userdata_sequence; " +
                $"ALTER TABLE {submissionsUserdata} ALTER id SET DEFAULT nextval('tmp_video_submissions_userdata_sequence'); " +
                $"ALTER SEQUENCE tmp_video_submissions_userdata_sequence OWNED BY {submissionsUserdata}.id; " +
                $"ALTER TABLE {submissionsUserdata} ADD CONSTRAINT video_submissions_userdata_submission_fkey FOREIGN KEY (submission) REFERENCES {videoSubmissions} (id) ON DELETE CASCADE; " +

                // temp played_characters table
                $"CREATE TEMP TABLE {playedCharacters} (LIKE played_characters INCLUDING ALL); " +
                $"ALTER TABLE {playedCharacters} ALTER id DROP DEFAULT; " +
                $"CREATE TEMP SEQUENCE tmp_played_characters_sequence; " +
                $"ALTER TABLE {playedCharacters} ALTER id SET DEFAULT nextval('tmp_played_characters_sequence'); " +
                $"ALTER SEQUENCE tmp_played_characters_sequence OWNED BY {playedCharacters}.id; " +
                $"ALTER TABLE {playedCharacters} ADD CONSTRAINT played_characters_submission_fkey FOREIGN KEY (submission) REFERENCES {videoSubmissions} (id) ON DELETE CASCADE; " +

                // temp played_floors table
                $"CREATE TEMP TABLE {playedFloors} (LIKE played_floors INCLUDING ALL); " +
                $"ALTER TABLE {playedFloors} ALTER id DROP DEFAULT; " +
                $"CREATE TEMP SEQUENCE tmp_played_floors_sequence; " +
                $"ALTER TABLE {playedFloors} ALTER id SET DEFAULT nextval('tmp_played_floors_sequence'); " +
                $"ALTER SEQUENCE tmp_played_floors_sequence OWNED BY {playedFloors}.id; " +
                $"ALTER TABLE {playedFloors} ADD CONSTRAINT played_floors_submission_fkey FOREIGN KEY (submission) REFERENCES {videoSubmissions} (id) ON DELETE CASCADE; " +
                $"ALTER TABLE {playedFloors} ADD CONSTRAINT played_floors_played_character_fkey FOREIGN KEY (played_character) REFERENCES {playedCharacters} (id) ON DELETE CASCADE; " +

                // temp gameplay_events table
                $"CREATE TEMP TABLE {gameplayEvents} (LIKE gameplay_events INCLUDING ALL); " +
                $"ALTER TABLE {gameplayEvents} ALTER id DROP DEFAULT; " +
                $"CREATE TEMP SEQUENCE tmp_gameplay_events_sequence; " +
                $"ALTER TABLE {gameplayEvents} ALTER id SET DEFAULT nextval('tmp_gameplay_events_sequence'); " +
                $"ALTER SEQUENCE tmp_gameplay_events_sequence OWNED BY {gameplayEvents}.id; " +
                $"ALTER TABLE {gameplayEvents} ADD CONSTRAINT gameplay_events_in_consequence_of_fkey FOREIGN KEY (in_consequence_of) REFERENCES {gameplayEvents} (id) ON DELETE CASCADE; " +
                $"ALTER TABLE {gameplayEvents} ADD CONSTRAINT gameplay_events_played_character_fkey FOREIGN KEY (played_character) REFERENCES {playedCharacters} (id) ON DELETE CASCADE; " +
                $"ALTER TABLE {gameplayEvents} ADD CONSTRAINT gameplay_events_played_floor_fkey FOREIGN KEY (played_floor) REFERENCES {playedFloors} (id) ON DELETE CASCADE; " +
                $"ALTER TABLE {gameplayEvents} ADD CONSTRAINT gameplay_events_submission_fkey FOREIGN KEY (submission) REFERENCES {videoSubmissions} (id) ON DELETE CASCADE; ";

            using var command = _npgsql.Command(session, commandText);
            await command.ExecuteNonQueryAsync();
        }


        private static List<SubmissionDifference> CompareSubmissions(NldbVideo? originalEpisode, NldbVideo? newEpisode)
        {
            var result = new List<SubmissionDifference>();

            if (originalEpisode is null)
            {
                result.Add(new(null, null, "the original episode is null"));
                return result;
            }

            if (newEpisode is null)
            {
                result.Add(new(null, null, "the new episode is null"));
                return result;
            }

            var originalSubmission = originalEpisode.Submissions.FirstOrDefault(e => e.Latest == true);
            var newSubmission = newEpisode.Submissions.FirstOrDefault(e => e.Latest == true);

            if (originalSubmission is null)
            {
                result.Add(new(null, null, "the original submission is null"));
                return result;
            }

            if (newSubmission is null)
            {
                result.Add(new(null, null, "the new submission is null"));
                return result;
            }

            // check if characters are the same
            var originalPlayedCharacters = originalSubmission.PlayedCharacters;
            var newPlayedCharacters = newSubmission.PlayedCharacters;
            var playedCharactersResult = PlayedCharactersAreTheSame(originalPlayedCharacters, newPlayedCharacters);

            if (playedCharactersResult?.Count > 0)
            {
                return playedCharactersResult;
            }

            // check if floors are the same
            var originalFloors = originalPlayedCharacters.SelectMany(p => p.PlayedFloors).ToList();
            var newFloors = newPlayedCharacters.SelectMany(p => p.PlayedFloors).ToList();
            var floorsResult = FloorsAreTheSame(originalFloors, newFloors);

            if (floorsResult?.Count > 0)
            {
                return floorsResult;
            }

            // check if gameplay events are the same
            var originalGameplayEvents = originalFloors.SelectMany(f => f.GameplayEvents);
            var newGameplayEvents = newFloors.SelectMany(f => f.GameplayEvents);

            var differences = GameplayEventsAreTheSame(originalGameplayEvents, newGameplayEvents);
            return differences;
        }


        private static List<SubmissionDifference>? PlayedCharactersAreTheSame(List<PlayedCharacter> originalPlayedCharacters, List<PlayedCharacter> newPlayedCharacters)
        {
            var result = new List<SubmissionDifference>();

            if (originalPlayedCharacters.Count != newPlayedCharacters.Count)
            {
                result.Add(new(null, null, $"different character amounts: {originalPlayedCharacters.Count} originally, {newPlayedCharacters.Count} after."));
                return result;
            }

            // check if characters are the same
            for (int i = 0; i < newPlayedCharacters.Count; ++i)
            {
                var originalCharacter = originalPlayedCharacters[i];
                var newCharacter = newPlayedCharacters[i];

                if (originalCharacter.GameCharacter.Id != newCharacter.GameCharacter.Id)
                {
                    result.Add(new(null, null, $"difference in played characters detected: {originalCharacter.GameCharacter.Id} originally, {newCharacter.GameCharacter.Id} after."));
                    return result;
                }
            }

            return null;
        }

        private static List<SubmissionDifference>? FloorsAreTheSame(List<PlayedFloor> originalFloors, List<PlayedFloor> newFloors)
        {
            var result = new List<SubmissionDifference>();

            if (originalFloors.Count != newFloors.Count)
            {
                result.Add(new(null, null, $"difference in floor count: {originalFloors.Count} originally, {newFloors.Count} after."));
                return result;
            }

            for (int i = 0; i < originalFloors.Count; ++i)
            {
                var originalFloor = originalFloors[i];
                var newFloor = newFloors[i];

                if (originalFloor.Floor.Id != newFloor.Floor.Id)
                {
                    result.Add(new(null, null, $"floor number {i} is different: {originalFloor.Floor.Id} originally, {newFloor.Floor.Id} after."));
                    return result;
                }
            }

            return null;
        }


        private static List<SubmissionDifference> GameplayEventsAreTheSame(IEnumerable<GameplayEvent> originalEvents, IEnumerable<GameplayEvent> newEvents)
        {
            var result = new List<SubmissionDifference>();
            var onlyExistsInNew = newEvents.Except(originalEvents, new GameplayEventComparer());

            foreach (var difference in onlyExistsInNew)
            {
                var message = $"difference: {difference.EventType}: {difference.Resource1.Id}";

                if (difference.Resource2 is not null)
                {
                    message += $" - {difference.Resource2.Id}";
                }

                if (difference.Resource3.HasValue)
                {
                    message += $" - {difference.Resource3.Value}";
                }

                result.Add(new(difference, null, message));
            }

            return result;
        }

        
        private static SubmittedCompleteEpisode? RecreateSubmission(NldbVideo? episode)
        {
            if (episode is null)
            {
                return null;
            }

            var submission = episode.Submissions.FirstOrDefault(s => s.Latest == true);

            if (submission is null)
            {
                return null;
            }

            return new SubmittedCompleteEpisode()
            {
                VideoId = episode.Id,
                PlayedCharacters = submission.PlayedCharacters.Select(c => new SubmittedPlayedCharacter()
                {
                    CharacterId = c.GameCharacter.Id,
                    GameMode = c.GameMode,
                    PlayedFloors = c.PlayedFloors.Select(f => new SubmittedPlayedFloor()
                    {
                        Duration = f.Duration,
                        FloorId = f.Floor.Id,

                        // filter out gameplay events that are added on the backend
                        GameplayEvents = f.GameplayEvents.Where(g =>
                            g.EventType == GameplayEventType.CoopPayerDeath ||
                            g.EventType == GameplayEventType.Respawn ||
                            g.EventType == GameplayEventType.Clicker ||
                            g.EventType == GameplayEventType.RerollTransform ||
                            g.EventType == GameplayEventType.ItemCollected ||
                            g.EventType == GameplayEventType.StartingTrinket ||
                            g.EventType == GameplayEventType.TaintedIsaacReplacedItem ||
                            g.EventType == GameplayEventType.Pill ||
                            g.EventType == GameplayEventType.Trinket ||
                            g.EventType == GameplayEventType.Bossfight ||
                            g.EventType == GameplayEventType.ItemTouched ||
                            g.EventType == GameplayEventType.AbsorbedItem ||
                            g.EventType == GameplayEventType.Rune ||
                            g.EventType == GameplayEventType.OtherConsumable ||
                            g.EventType == GameplayEventType.CharacterReroll ||
                            g.EventType == GameplayEventType.TarotCard ||
                            g.EventType == GameplayEventType.CharacterDied ||
                            g.EventType == GameplayEventType.Curse
                        ).Select(g => new SubmittedGameplayEvent()
                        {
                            EventType = g.EventType,
                            Player = g.Player,
                            RelatedResource1 = g.Resource1.Id,
                            RelatedResource2 = g.Resource2?.Id,
                            RelatedResource3 = g.Resource3,
                            Rerolled = g.WasRerolled
                        }).ToList()
                    }).ToList(),
                    Seed = c.Seed
                }).ToList()
            };
        }
    }
}
