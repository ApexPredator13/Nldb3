using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Models.Validation.SubmitEpisode;
using Website.Services;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;
using Google.Apis.Services;
using Microsoft.Extensions.Configuration;

namespace Website.Data
{
    public class VideoRepository : IVideoRepository
    {
        private readonly IDbConnector _connector;
        private readonly IModRepository _modRepository;
        private readonly IIsaacRepository _isaacRepository;
        private readonly IConfiguration _config;

        public VideoRepository(IDbConnector connector, IModRepository modRepository, IIsaacRepository isaacRepository, IConfiguration config)
        {
            _connector = connector;
            _modRepository = modRepository;
            _isaacRepository = isaacRepository;
            _config = config;
        }

        public async Task<int> CountVideos()
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT COUNT(*) FROM videos; ", c);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<VideoListResponse> GetYoutubeVideoData(params string[] videoIds)
        {
            var youtubeServiceInitializer = new BaseClientService.Initializer()
            {
                ApiKey = _config["GoogleApiKey"],
                ApplicationName = "The Northernlion Database"
            };

            var youtubeService = new YouTubeService(youtubeServiceInitializer);
            VideosResource.ListRequest listRequest = youtubeService.Videos.List("snippet,contentDetails,statistics");
            listRequest.Id = string.Join(',', videoIds);

            var result = await listRequest.ExecuteAsync();
            return result;
        }

        public async Task<DateTime?> GetVideoReleasedate(string videoId)
        {
            DateTime? result = null;

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT published FROM videos WHERE id = @Id; ", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Char, videoId);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                r.Read();
                result = r.GetDateTime(0);
            }

            return result;
        }

        public async Task<string?> GetVideoTitle(string videoId)
        {
            string? result = null;

            using (var c = await _connector.Connect())
            {
                using var q = new NpgsqlCommand("SELECT title FROM videos WHERE id = @Id; ", c);
                q.Parameters.AddWithValue("@Id", NpgsqlDbType.Char, videoId);

                using var r = await q.ExecuteReaderAsync();

                if (r.HasRows)
                {
                    r.Read();
                    result = r.GetString(0);
                }
            }
            return result;
        }

        public async Task<int> CountVideoSubmissions()
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT COUNT(*) FROM video_submissions; ", c);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task SaveVideo(SaveVideo newVideo)
        {
            string commandText =
                "INSERT INTO videos (id, title, published, duration, needs_update, likes, dislikes, view_count, favourite_count, comment_count, tags, is_3d, is_hd, cc) " +
                "VALUES (@Id, @Title, @Pub, @Dur, @Needs, @Likes, @Dislikes, @ViewCount, @Fav, @CC, @Tags, @Is3D, @IsHD, @Cap); ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(commandText, c);

            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Varchar, newVideo.Id);
            q.Parameters.AddWithValue("@Title", NpgsqlDbType.Varchar, newVideo.Title);
            q.Parameters.AddWithValue("@Pub", NpgsqlDbType.TimestampTz, newVideo.Published);
            q.Parameters.AddWithValue("@Dur", NpgsqlDbType.Integer, newVideo.Duration);
            q.Parameters.AddWithValue("@Needs", NpgsqlDbType.Boolean, newVideo.NeedsUpdate);
            q.Parameters.AddWithValue("@Likes", NpgsqlDbType.Integer, newVideo.Likes ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@Dislikes", NpgsqlDbType.Integer, newVideo.Dislikes ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@ViewCount", NpgsqlDbType.Integer, newVideo.ViewCount ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@Fav", NpgsqlDbType.Integer, newVideo.FavouriteCount ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@CC", NpgsqlDbType.Integer, newVideo.CommentCount ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@Tags", NpgsqlDbType.Array | NpgsqlDbType.Varchar, newVideo.Tags != null && newVideo.Tags.Count > 0 ? newVideo.Tags : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Is3D", NpgsqlDbType.Boolean, newVideo.Is3D);
            q.Parameters.AddWithValue("@IsHD", NpgsqlDbType.Boolean, newVideo.IsHD);
            q.Parameters.AddWithValue("@Cap", NpgsqlDbType.Boolean, newVideo.HasCaption);

            await q.ExecuteNonQueryAsync();
        }

        public async Task<Video> GetVideoById(string videoId, bool includeVideoSubmissions)
        {
            var commandText = includeVideoSubmissions
                ?   "SELECT id, title, published, duration, needs_update, likes, dislikes, view_count, favourite_count, comment_count, tags, is_3d, is_hd, cc FROM videos WHERE id = @VideoId; "
                :   "SELECT " +
                        "v.id, v.title, v.published, v.duration, v.needs_update, v.likes, v.dislikes, " +
                        "v.view_count, v.favourite_count, v.comment_count, v.tags, v.is_3d, v.is_hd, v.cc, " +
                        "s.s_type, s.latest, " +
                        "pc.id, pc.action, pc.run_number, pc.died_from, " +
                        "pci.id, pci.name, pci.type, pci.exists_in, pci.x, pci.game_mode, pci.color, pci.display_order, pci.difficulty, " +
                        "pcd.id, pcd.name, pcd.type, pcd.exists_in, pcd.x, pcd.game_mode, pcd.color, pcd.display_order, pcd.difficulty, " +
                        "pcim.id, pcim.name, " +
                        "pcimu.id, pcimu.url, pcimu.name, " +
                        "pcit.id, pcit.value, " +
                        "pf.id, pf.action, pf.run_number, pf.floor_number, " +
                        "pff.id, pff.name, pff.type, pff.exists_in, pff.x, pff.game_mode, pff.color, pff.display_order, pff.difficulty, " +
                        "pfd.id, pfd.name, pfd.type, pfd.exists_in, pfd.x, pfd.game_mode, pfd.color, pfd.display_order, pfd.difficulty, " +
                        "ge.event_type, ge.resource_three, ge.action, ge.run_number, ge.floor_number, " +
                        "ge1.id, ge1.name, ge1.type, ge1.exists_in, ge1.x, ge1.game_mode, ge1.color, ge1.display_order, ge1.difficulty, " +
                        "ge2.id, ge2.name, ge2.type, ge2.exists_in, ge2.x, ge2.game_mode, ge2.color, ge2.display_order, ge2.difficulty " +
                    "FROM videos v " +
                    "LEFT JOIN video_submissions s ON s.video = v.id " +
                    "LEFT JOIN (SELECT * FROM played_characters WHERE video = @VideoId) pc ON pc.submission = s.id " +
                    "LEFT JOIN isaac_resources pci ON pci.id = pc.game_character " +
                    "LEFT JOIN isaac_resources pcd ON pci.id = pc.died_from " +
                    "LEFT JOIN mods pcim ON pcim.id = pci.mod " +
                    "LEFT JOIN mod_url pcimu ON pcimu.mod = pcim.id " +
                    "LEFT JOIN tags pcit ON pcit.isaac_resource = pci.id " +
                    "LEFT JOIN played_floors pf ON pc.id = pf.played_character " +
                    "LEFT JOIN isaac_resources pff ON pff.id = pf.floor " +
                    "LEFT JOIN isaac_resources pfd ON pfd.id = pf.died_from " +
                    "LEFT JOIN gameplay_events ge ON pf.id = pf.played_floor " +
                    "LEFT JOIN isaac_resources ge1 ON ge1.id = ge.resource_one " +
                    "LEFT JOIN isaac_resources ge2 ON ge2.id = ge.resource_two " +
                    "WHERE v.id = @VideoId";

            throw new NotImplementedException();
        }

        public async Task SubmitLostEpisode(string videoId, string userId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand($"INSERT INTO video_submissions (video, sub, s_type, latest) VALUES (@V, @U, @ST, FALSE); ", c);

            q.Parameters.AddWithValue("@V", NpgsqlDbType.Char, videoId);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Varchar, userId);
            q.Parameters.AddWithValue("@ST", NpgsqlDbType.Integer, (int)SubmissionType.Lost);

            await q.ExecuteNonQueryAsync();
        }

        public class TransformationProgress
        {
            public string Resource { get; set; } = string.Empty;
            public string Transformation { get; set; } = string.Empty;
            public int Player { get; set; } = 0;
        }

        public async Task SubmitEpisode(SubmittedCompleteEpisode episode, string userId, SubmissionType type = SubmissionType.New)
        {
            // check if any mods were used
            var usedMods = await _modRepository.GetUsedModsForSubmittedEpisode(episode);
            var videoReleasedate = await GetVideoReleasedate(episode.VideoId) ?? DateTime.Now;
            var videoTitle = await GetVideoTitle(episode.VideoId) ?? string.Empty;
            var transformationProgress = new List<TransformationProgress>();

            // create submission
            var s = new StringBuilder();
            int characterCounter = 0;
            int floorCounter = 0;
            int eventCounter = 0;
            int characterDeathCounter = 0;
            int floorDeathCounter = 0;

            int runNumber = 0;
            int currentFloorNumber = 0;
            int gameplayAction = 0;
            var lastFloor = string.Empty;
            string? lastDeath = null;

            var parameters = new List<NpgsqlParameter>();

            // save video submission
            s.Append("START TRANSACTION; ");
            s.Append("UPDATE video_submissions SET latest = FALSE WHERE video = @LatestVideoId; ");
            parameters.Add(new NpgsqlParameter("@LatestVideoId", NpgsqlDbType.Char) { Value = episode.VideoId });

            s.Append("INSERT INTO video_submissions (video, sub, s_type, latest) VALUES (@Video, @Sub, @Type, TRUE); ");
            parameters.Add(new NpgsqlParameter("@Video", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
            parameters.Add(new NpgsqlParameter("@Sub", NpgsqlDbType.Text) { NpgsqlValue = userId });
            parameters.Add(new NpgsqlParameter("@Type", NpgsqlDbType.Integer) { NpgsqlValue = (int)type });

            foreach (var character in episode.PlayedCharacters)
            {
                // reset run
                runNumber++;
                currentFloorNumber = 0;
                gameplayAction = 1;
                transformationProgress.Clear();
                lastDeath = null;

                // save character
                s.Append($"INSERT INTO played_characters (game_character, submission, action, video, run_number, died_from) VALUES (@CCharacter{characterCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id')), @CAction{characterCounter}, @CVideo{characterCounter}, @CRunNumber{characterCounter}, NULL); ");
                parameters.Add(new NpgsqlParameter($"@CCharacter{characterCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = character.CharacterId });
                parameters.Add(new NpgsqlParameter($"@CAction{characterCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                parameters.Add(new NpgsqlParameter($"@CVideo{characterCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                parameters.Add(new NpgsqlParameter($"@CRunNumber{characterCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });

                for (int i = 0; i < character.PlayedFloors.Count; i++)
                {
                    var floor = character.PlayedFloors[i];
                    var isLastFloorOfTheRun = i == character.PlayedFloors.Count - 1;
                
                    currentFloorNumber++;
                    lastFloor = floor.FloorId;

                    // save floor into character
                    s.Append($"INSERT INTO played_floors (floor, played_character, video, action, run_number, floor_number, died_from, submission) VALUES (@FFloor{floorCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @FVideo{floorCounter}, @FAction{floorCounter}, @FRunNum{floorCounter}, @FCurrF{floorCounter}, NULL, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                    parameters.Add(new NpgsqlParameter($"@FFloor{floorCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = floor.FloorId });
                    parameters.Add(new NpgsqlParameter($"@FVideo{floorCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@FAction{floorCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                    parameters.Add(new NpgsqlParameter($"@FRunNum{floorCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                    parameters.Add(new NpgsqlParameter($"@FCurrF{floorCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });

                    // save all gameplay events into the floor
                    foreach (var e in floor.gameplayEvents)
                    {
                        if (e.EventType == GameplayEventType.CharacterDied)
                        {
                            lastDeath = e.RelatedResource1;
                        }

                        // STEP 1 - save gameplay event
                        s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) " +
                                 $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                        parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)e.EventType });
                        parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                        parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource2 ?? (object)DBNull.Value });
                        parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.RelatedResource3 ?? (object)DBNull.Value });
                        parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                        parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                        parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                        parameters.Add(new NpgsqlParameter($"@Player{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.Player ?? (object)DBNull.Value });
                        parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });

                        // check if resource is part of any transformations
                        var itemTransformationData = await _isaacRepository.GetTransformationData(e.RelatedResource1, videoTitle, videoReleasedate);

                        // needed to relate multiple next events to the event above. will be subtracted from the serial ID
                        int subtractFromSequence = 1;

                        // STEP 2.1 - insert transformation data
                        if (itemTransformationData.Count > 0)
                        {
                            foreach (var (transformation, countsMultipleTimes, numberOfItemsRequired) in itemTransformationData)
                            {
                                // don't process items that don't count multiple times
                                if (countsMultipleTimes || !transformationProgress.Any(x => x.Transformation == transformation && x.Resource == e.RelatedResource1))
                                {
                                    // add transformation progress
                                    transformationProgress.Add(new TransformationProgress() { Resource = e.RelatedResource1, Transformation = transformation, Player = e.Player!.Value });
                                    s.Append("INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) VALUES ");
                                    s.Append($"(@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, CURRVAL(pg_get_serial_sequence('gameplay_events', 'id')) - {subtractFromSequence++}, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.TransformationProgress });
                                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                    parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = transformation });
                                    parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = transformationProgress.Count(x => x.Transformation == transformation) });
                                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                    parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                                    parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                                    parameters.Add(new NpgsqlParameter($"@Player{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.Player!.Value });
                                    parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });

                                    // check if transformation happened after this item
                                    if (transformationProgress.Count(x => x.Transformation == transformation && x.Player == e.Player!.Value) == numberOfItemsRequired)
                                    {
                                        s.Append("INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) VALUES ");
                                        s.Append($"(@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, NULL, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, CURRVAL(pg_get_serial_sequence('gameplay_events', 'id')) - {subtractFromSequence++}, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                                        parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.TransformationComplete });
                                        parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                        parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = transformation });
                                        parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                        parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                                        parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                                        parameters.Add(new NpgsqlParameter($"@Player{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.Player!.Value });
                                        parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                                    }
                                }
                            }
                        }
                    }

                    // STEP 3 - down to the next floor
                    if (!isLastFloorOfTheRun)
                    {
                        s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) " +
                             $"VALUES (@Type{eventCounter}, @One{eventCounter}, NULL, NULL, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, NULL, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                        parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.DownToTheNextFloor });
                        parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = floor.FloorId });
                        parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                        parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                        parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                        parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                    }
                }

                // STEP 4 - save death to character and floor
                if (!string.IsNullOrEmpty(lastDeath))
                {
                    s.Append($"UPDATE played_characters SET died_from = @CDF{characterDeathCounter} WHERE id = CURRVAL(pg_get_serial_sequence('played_characters', 'id')); ");
                    parameters.Add(new NpgsqlParameter($"@CDF{characterDeathCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = lastDeath });

                    s.Append($"UPDATE played_floors SET died_from = @FDF{floorDeathCounter} WHERE id = CURRVAL(pg_get_serial_sequence('played_floors', 'id')); ");
                    parameters.Add(new NpgsqlParameter($"@FDF{floorDeathCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = lastDeath });
                }

                // STEP 5 - won or lost the run
                if (!string.IsNullOrEmpty(lastDeath))
                {
                    s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) " +
                             $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, NULL, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.LostTheRun });
                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = character.CharacterId });
                    parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = lastFloor });
                    parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = character.PlayedFloors.Count });
                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                    parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                    parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                }
                else
                {
                    s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) " +
                             $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, NULL, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.WonTheRun });
                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = character.CharacterId });
                    parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = lastFloor });
                    parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = character.PlayedFloors.Count });
                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                    parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                    parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                }
            }

            s.Append("COMMIT; ");

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(s.ToString(), c);
            q.Parameters.AddRange(parameters.ToArray());
            int dbChanges = await q.ExecuteNonQueryAsync();
        }

        public async Task<Models.Database.Video?> GetVideoById(string videoId)
        {
            Models.Database.Video? result = null;
            string query = 
                "SELECT " +
                    "v.id, v.title, v.published AT TIME ZONE 'UTC', v.duration, v.needs_update, v.likes, v.dislikes, v.view_count, v.favourite_count, v.comment_count, v.tags, v.is_3d, v.is_hd, v.cc, " +
                    "t.id, t.type, t.url, t.width, t.height " +
                "FROM videos v " +
                "LEFT JOIN thumbnails t ON t.video = v.id " +
                "WHERE v.id = @Id; ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Char, videoId);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;

                    if (result is null)
                    {
                        result = new Models.Database.Video()
                        {
                            Id = r.GetString(i++),
                            Title = r.GetString(i++),
                            Published = r.GetDateTime(i++),
                            Duration = TimeSpan.FromSeconds(r.GetInt32(i++)),
                            RequiresUpdate = r.GetBoolean(i++),
                            Likes = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Dislikes = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            ViewCount = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            FavouriteCount = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            CommentCount = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? new List<string>() : ((string[])r[i - 1]).ToList(),
                            Is3D = r.GetBoolean(i++),
                            IsHD = r.GetBoolean(i++),
                            HasCaption = r.GetBoolean(i++),
                            Submissions = new List<Models.Database.SubmittedEpisode>(),
                            Thumbnails = new List<Models.Database.Thumbnail>()
                        };
                    }
                    else i += 16;

                    if (!r.IsDBNull(i) && !result.Thumbnails.Any(x => x.Id == r.GetInt32(i)))
                    {
                        result.Thumbnails.Add(new Models.Database.Thumbnail()
                        {
                            Id = r.GetInt32(i++),
                            Type = r.GetString(i++),
                            Url = r.GetString(i++),
                            Width = r.GetInt32(i++),
                            Height = r.GetInt32(i++)
                        });
                    }
                }
            }

            return result;
        }

        public async Task<Models.Database.Video?> GetCompleteEpisode(string videoId)
        {
            var getVideoData = GetVideoById(videoId);
            var getGameplayEventsTask = _isaacRepository.GetGameplayEventsForVideo(videoId);
            var getFloorsTask = _isaacRepository.GetFloorsForVideo(videoId);
            var getPlayedCharactersTask = _isaacRepository.GetPlayedCharactersForVideo(videoId);
            var getSubmittedEpisodesTask = _isaacRepository.GetSubmittedEpisodesForVideo(videoId);

            await Task.WhenAll(getVideoData, getGameplayEventsTask, getFloorsTask, getPlayedCharactersTask, getSubmittedEpisodesTask);

            var video = await getVideoData;
            var submissions = await getSubmittedEpisodesTask;
            var playedCharacters = await getPlayedCharactersTask;
            var playedFloors = await getFloorsTask;
            var gameplayEvents = await getGameplayEventsTask;

            foreach (var playedCharacter in playedCharacters)
            {
                submissions
                    .FirstOrDefault(x => x.Id == playedCharacter.Submission)
                    ?.PlayedCharacters
                    ?.Add(playedCharacter);
            }
            foreach (var playedFloor in playedFloors)
            {
                submissions
                    .FirstOrDefault(x => x.Id == playedFloor.Submission)
                    ?.PlayedCharacters
                    ?.FirstOrDefault(x => x.RunNumber == playedFloor.RunNumber)
                    ?.PlayedFloors
                    ?.Add(playedFloor);
            }
            foreach (var gameplayEvent in gameplayEvents)
            {
                submissions
                    .FirstOrDefault(x => x.Id == gameplayEvent.Submission)
                    ?.PlayedCharacters
                    ?.FirstOrDefault(x => x.RunNumber == gameplayEvent.RunNumber)
                    ?.PlayedFloors
                    ?.FirstOrDefault(x => x.FloorNumber == gameplayEvent.FloorNumber)
                    ?.GameplayEvents
                    ?.Add(gameplayEvent);
            }

            video!.Submissions = submissions;
            return video;
        }
    }
}
