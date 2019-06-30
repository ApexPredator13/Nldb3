using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Services;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;
using Google.Apis.Services;
using Microsoft.Extensions.Configuration;
using System.Xml;
using Website.Models.Database;
using Website.Models;

namespace Website.Data
{
    public class VideoRepository : IVideoRepository
    {
        private readonly IDbConnector _connector;
        private readonly IModRepository _modRepository;
        private readonly IIsaacRepository _isaacRepository;
        private readonly IConfiguration _config;
        private readonly IFormatProvider _formatProvider;

        public VideoRepository(IDbConnector connector, IModRepository modRepository, IIsaacRepository isaacRepository, IConfiguration config)
        {
            _connector = connector;
            _modRepository = modRepository;
            _isaacRepository = isaacRepository;
            _config = config;
            _formatProvider = new System.Globalization.CultureInfo("en-US");
        }

        private bool RequireWhere(GetVideos request)
        {
            if (request.From != null || request.Search != null || request.Until != null)
            {
                return true;
            }
            return false;
        }

        public async Task<DateTime> GetMostRecentVideoReleaseDate()
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT MAX(published) FROM videos;", c);
            return Convert.ToDateTime(await q.ExecuteScalarAsync());
        }

        public async Task<DateTime> GetFirstVideoReleaseDate()
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT MIN(published) FROM videos;", c);
            return Convert.ToDateTime(await q.ExecuteScalarAsync());
        }

        public async Task<int> CountVideos(GetVideos? request = null)
        {
            if (request is null)
            {
                request = new GetVideos();
            }

            var s = new StringBuilder();
            var parameters = new List<NpgsqlParameter>();

            var requireAnd = false;
            var requireWhere = RequireWhere(request);
            s.Append("SELECT COUNT(*) FROM videos");

            if (requireWhere)
            {
                s.Append(" WHERE");
            }

            if (!string.IsNullOrEmpty(request.Search))
            {
                s.Append(" LOWER(title) LIKE (@Search)");
                parameters.Add(new NpgsqlParameter("@Search", NpgsqlDbType.Text) { NpgsqlValue = $"%{request.Search}%" });
                requireAnd = true;
            }

            if (request.From != null)
            {
                if (requireAnd)
                {
                    s.Append(" AND");
                }
                s.Append(" published >= @From");
                parameters.Add(new NpgsqlParameter("@From", NpgsqlDbType.TimestampTz) { NpgsqlValue = request.From.Value });
                requireAnd = true;
            }

            if (request.Until != null)
            {
                if (requireAnd)
                {
                    s.Append(" AND");
                }
                s.Append(" published <= @Until");
                parameters.Add(new NpgsqlParameter("@Until", NpgsqlDbType.TimestampTz) { NpgsqlValue = request.Until.Value });
            }

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(s.ToString(), c);
            q.Parameters.AddRange(parameters.ToArray());

            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<bool> VideoExists(string videoId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT 1 FROM videos WHERE id = @Id;", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, videoId);
            using var r = await q.ExecuteReaderAsync();
            return r.HasRows;
        }

        public async Task<VideoListResponse> GetYoutubeVideoData(params string[] videoIds)
        {
            var youtubeServiceInitializer = new BaseClientService.Initializer()
            {
                ApiKey = _config["GoogleApiKey"],
                ApplicationName = "The Northernlion Database"
            };

            using var youtubeService = new YouTubeService(youtubeServiceInitializer);
            VideosResource.ListRequest listRequest = youtubeService.Videos.List("snippet,contentDetails,statistics");
            listRequest.Id = string.Join(',', videoIds);

            var result = await listRequest.ExecuteAsync();
            return result;
        }

        public async Task<DateTime?> GetVideoReleasedate(string videoId)
        {
            DateTime? result = null;

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT published AT TIME ZONE 'UTC' FROM videos WHERE id = @Id; ", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, videoId);

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
                q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, videoId);

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

        public async Task SaveVideo(Video newVideo)
        {
            string commandText =
                "INSERT INTO videos (id, title, published, duration, needs_update, likes, dislikes, view_count, favorite_count, comment_count, tags, is_3d, is_hd, cc) " +
                "VALUES (@Id, @Title, @Pub, @Dur, FALSE, @Likes, @Dislikes, @ViewCount, @Fav, @CC, @Tags, @Is3D, @IsHD, @Cap); ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(commandText, c);

            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, newVideo.Id);
            q.Parameters.AddWithValue("@Title", NpgsqlDbType.Text, newVideo.Snippet.Title);
            q.Parameters.AddWithValue("@Pub", NpgsqlDbType.TimestampTz, newVideo.Snippet.PublishedAt ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@Dur", NpgsqlDbType.Integer, (int)(XmlConvert.ToTimeSpan(newVideo.ContentDetails.Duration).TotalSeconds));
            q.Parameters.AddWithValue("@Likes", NpgsqlDbType.Integer, newVideo.Statistics.LikeCount.HasValue ? (int)newVideo.Statistics.LikeCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Dislikes", NpgsqlDbType.Integer, newVideo.Statistics.DislikeCount.HasValue ? (int)newVideo.Statistics.DislikeCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@ViewCount", NpgsqlDbType.Integer, newVideo.Statistics.ViewCount.HasValue ? (int)newVideo.Statistics.ViewCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Fav", NpgsqlDbType.Integer, newVideo.Statistics.FavoriteCount.HasValue ? (int)newVideo.Statistics.FavoriteCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@CC", NpgsqlDbType.Integer, newVideo.Statistics.CommentCount.HasValue ? (int)newVideo.Statistics.CommentCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Tags", NpgsqlDbType.Array | NpgsqlDbType.Text, newVideo.Snippet.Tags != null && newVideo.Snippet.Tags.Count > 0 ? newVideo.Snippet.Tags : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Is3D", NpgsqlDbType.Boolean, string.IsNullOrEmpty(newVideo.ContentDetails.Dimension) ? (object)DBNull.Value : newVideo.ContentDetails.Dimension.ToLower() == "3d");
            q.Parameters.AddWithValue("@IsHD", NpgsqlDbType.Boolean, string.IsNullOrEmpty(newVideo.ContentDetails.Definition) ? (object)DBNull.Value : newVideo.ContentDetails.Definition.ToLower() == "hd");
            q.Parameters.AddWithValue("@Cap", NpgsqlDbType.Boolean, string.IsNullOrEmpty(newVideo.ContentDetails.Caption) ? (object)DBNull.Value : newVideo.ContentDetails.Caption.ToLower() == "true");

            await q.ExecuteNonQueryAsync();
        }

        public async Task<int> UpdateVideo(Video updatedVideo)
        {
            string commandText =
                "UPDATE videos SET title = @Title, published = @Pub, Duration = @Dur, " +
                    "likes = @Likes, dislikes = @Dislikes, view_count = @ViewCount, favorite_count = @Fav, " +
                    "comment_count = @CC, tags = @Tags, is_3d = @Is3D, is_hd = @IsHD, cc = @Cap " +
                "WHERE id = @Id;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(commandText, c);

            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, updatedVideo.Id);
            q.Parameters.AddWithValue("@Title", NpgsqlDbType.Text, updatedVideo.Snippet.Title);
            q.Parameters.AddWithValue("@Pub", NpgsqlDbType.TimestampTz, updatedVideo.Snippet.PublishedAt ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@Dur", NpgsqlDbType.Integer, (int)(XmlConvert.ToTimeSpan(updatedVideo.ContentDetails.Duration).TotalSeconds));
            q.Parameters.AddWithValue("@Likes", NpgsqlDbType.Integer, updatedVideo.Statistics.LikeCount.HasValue ? (int)updatedVideo.Statistics.LikeCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Dislikes", NpgsqlDbType.Integer, updatedVideo.Statistics.DislikeCount.HasValue ? (int)updatedVideo.Statistics.DislikeCount : (object)DBNull.Value);
            q.Parameters.AddWithValue("@ViewCount", NpgsqlDbType.Integer, updatedVideo.Statistics.ViewCount.HasValue ? (int)updatedVideo.Statistics.ViewCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Fav", NpgsqlDbType.Integer, updatedVideo.Statistics.FavoriteCount.HasValue ? (int)updatedVideo.Statistics.FavoriteCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@CC", NpgsqlDbType.Integer, updatedVideo.Statistics.CommentCount.HasValue ? (int)updatedVideo.Statistics.CommentCount.Value : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Tags", NpgsqlDbType.Array | NpgsqlDbType.Text, updatedVideo.Snippet.Tags != null && updatedVideo.Snippet.Tags.Count > 0 ? updatedVideo.Snippet.Tags : (object)DBNull.Value);
            q.Parameters.AddWithValue("@Is3D", NpgsqlDbType.Boolean, updatedVideo.ContentDetails.Dimension.ToLower() == "3d");
            q.Parameters.AddWithValue("@IsHD", NpgsqlDbType.Boolean, updatedVideo.ContentDetails.Definition.ToLower() == "hd");
            q.Parameters.AddWithValue("@Cap", NpgsqlDbType.Boolean, updatedVideo.ContentDetails.Caption.ToLower() == "true");

            return await q.ExecuteNonQueryAsync();
        }

        public async Task SubmitLostEpisode(string videoId, string userId)
        {
            var query =
                "START TRANSACTION; " +
                "INSERT INTO video_submissions (video, s_type, latest) VALUES (@V, @ST, FALSE); " +
                "INSERT INTO video_submissions_userdata (submission, user_id) VALUES (CURRVAL(pg_get_serial_sequence('video_submissions', 'id')), @U); " +
                "COMMIT;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);

            q.Parameters.AddWithValue("@V", NpgsqlDbType.Text, videoId);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            q.Parameters.AddWithValue("@ST", NpgsqlDbType.Integer, (int)SubmissionType.Lost);

            await q.ExecuteNonQueryAsync();
        }

        public async Task<int?> GetVideoLength(string videoId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT duration FROM videos WHERE id = @Id", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, videoId);
            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                r.Read();
                return r.GetInt32(0);
            }
            else
            {
                return null;
            }
        }

        private class TransformationProgress
        {
            internal string Resource { get; set; } = string.Empty;
            internal string Transformation { get; set; } = string.Empty;
            internal int Player { get; set; } = 0;
        }

        public async Task SubmitEpisode(SubmittedCompleteEpisode episode, string userId, SubmissionType type = SubmissionType.New)
        {
            // check if any mods were used
            var usedMods = await _modRepository.GetUsedModsForSubmittedEpisode(episode);
            var videoReleasedate = await GetVideoReleasedate(episode.VideoId) ?? DateTime.Now;
            var videoTitle = await GetVideoTitle(episode.VideoId) ?? string.Empty;
            var videoLength = await GetVideoLength(episode.VideoId);
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
            int cumulativeVideoLength = 0;

            var parameters = new List<NpgsqlParameter>();

            // save video submission
            s.Append("START TRANSACTION; ");
            s.Append("UPDATE video_submissions SET latest = FALSE WHERE video = @LatestVideoId; ");
            parameters.Add(new NpgsqlParameter("@LatestVideoId", NpgsqlDbType.Text) { Value = episode.VideoId });

            s.Append("INSERT INTO video_submissions (video, s_type, latest) VALUES (@Video, @Type, TRUE); ");
            s.Append("INSERT INTO video_submissions_userdata (submission, user_id) VALUES (CURRVAL(pg_get_serial_sequence('video_submissions', 'id')), @Sub); ");
            parameters.Add(new NpgsqlParameter("@Video", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
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
                cumulativeVideoLength = 0;

                // save character
                s.Append($"INSERT INTO played_characters (game_character, submission, action, video, run_number, died_from) VALUES (@CCharacter{characterCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id')), @CAction{characterCounter}, @CVideo{characterCounter}, @CRunNumber{characterCounter}, NULL); ");
                parameters.Add(new NpgsqlParameter($"@CCharacter{characterCounter}", NpgsqlDbType.Text) { NpgsqlValue = character.CharacterId });
                parameters.Add(new NpgsqlParameter($"@CAction{characterCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                parameters.Add(new NpgsqlParameter($"@CVideo{characterCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
                parameters.Add(new NpgsqlParameter($"@CRunNumber{characterCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });

                for (int i = 0; i < character.PlayedFloors.Count; i++)
                {
                    var floor = character.PlayedFloors[i];

                    // get floor duration
                    if (floor.Duration is null)
                    {
                        // last one is null, subtract lengt so far from video length
                        floor.Duration = (await GetVideoLength(episode.VideoId) ?? 0) - cumulativeVideoLength;
                    }
                    else
                    {
                        cumulativeVideoLength += floor.Duration.Value;
                    }

                    cumulativeVideoLength += floor.Duration ?? 0;
                    var isLastFloorOfTheRun = i == character.PlayedFloors.Count - 1;

                    currentFloorNumber++;
                    lastFloor = floor.FloorId;

                    // save floor into character
                    s.Append($"INSERT INTO played_floors (floor, played_character, video, action, run_number, floor_number, died_from, submission, duration) VALUES (@FFloor{floorCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @FVideo{floorCounter}, @FAction{floorCounter}, @FRunNum{floorCounter}, @FCurrF{floorCounter}, NULL, CURRVAL(pg_get_serial_sequence('video_submissions', 'id')), @FCurrDur{floorCounter}); ");
                    parameters.Add(new NpgsqlParameter($"@FFloor{floorCounter}", NpgsqlDbType.Text) { NpgsqlValue = floor.FloorId });
                    parameters.Add(new NpgsqlParameter($"@FVideo{floorCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@FAction{floorCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                    parameters.Add(new NpgsqlParameter($"@FRunNum{floorCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                    parameters.Add(new NpgsqlParameter($"@FCurrF{floorCounter}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                    parameters.Add(new NpgsqlParameter($"@FCurrDur{floorCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = floor.Duration!.Value });

                    // save all gameplay events into the floor
                    foreach (var e in floor.GameplayEvents)
                    {
                        if (e.EventType == GameplayEventType.CharacterDied)
                        {
                            lastDeath = e.RelatedResource1;
                        }

                        // STEP 1 - save gameplay event
                        s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) " +
                                 $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                        parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)e.EventType });
                        parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = e.RelatedResource1 });
                        parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = e.RelatedResource2 ?? (object)DBNull.Value });
                        parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.RelatedResource3 ?? (object)DBNull.Value });
                        parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
                        parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                        parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                        parameters.Add(new NpgsqlParameter($"@Player{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.Player ?? (object)DBNull.Value });
                        parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });

                        // check if resource is part of any transformations
                        var itemTransformationData = await _isaacRepository.GetTransformationData(e.RelatedResource1, videoTitle, videoReleasedate);

                        // needed to relate multiple next events to the event above. will be subtracted from the serial ID
                        int subtractFromSequence = 1;

                        // STEP 2 - insert transformation data
                        if (itemTransformationData.Count > 0)
                        {
                            foreach (var data in itemTransformationData)
                            {
                                var transformation = data.transformation;
                                var countsMultipleTimes = data.countsMultipleTimes;
                                var numberOfItemsRequired = data.stepsNeeded;

                                // don't process items that don't count multiple times
                                if (countsMultipleTimes || !transformationProgress.Any(x => x.Transformation == transformation && x.Resource == e.RelatedResource1))
                                {
                                    // add transformation progress
                                    if (e.Player is null)
                                    {
                                        e.Player = 1;
                                    }

                                    transformationProgress.Add(new TransformationProgress() { Resource = e.RelatedResource1, Transformation = transformation, Player = e.Player!.Value });
                                    s.Append("INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) VALUES ");
                                    s.Append($"(@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, CURRVAL(pg_get_serial_sequence('gameplay_events', 'id')) - {subtractFromSequence++}, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.TransformationProgress });
                                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = e.RelatedResource1 });
                                    parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = transformation });
                                    parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = transformationProgress.Count(x => x.Transformation == transformation) });
                                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
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
                                        parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = e.RelatedResource1 });
                                        parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = transformation });
                                        parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
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
                        parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = floor.FloorId });
                        parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
                        parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                        parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                        parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                    }
                }

                // STEP 4 - save death to character and floor, if character died
                if (!string.IsNullOrEmpty(lastDeath))
                {
                    s.Append($"UPDATE played_characters SET died_from = @CDF{characterDeathCounter} WHERE id = CURRVAL(pg_get_serial_sequence('played_characters', 'id')); ");
                    parameters.Add(new NpgsqlParameter($"@CDF{characterDeathCounter++}", NpgsqlDbType.Text) { NpgsqlValue = lastDeath });

                    s.Append($"UPDATE played_floors SET died_from = @FDF{floorDeathCounter} WHERE id = CURRVAL(pg_get_serial_sequence('played_floors', 'id')); ");
                    parameters.Add(new NpgsqlParameter($"@FDF{floorDeathCounter++}", NpgsqlDbType.Text) { NpgsqlValue = lastDeath });
                }

                // STEP 5 - won or lost the run
                if (!string.IsNullOrEmpty(lastDeath))
                {
                    s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) " +
                             $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, NULL, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.LostTheRun });
                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = character.CharacterId });
                    parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = lastFloor });
                    parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = character.PlayedFloors.Count });
                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                    parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                    parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                }
                else
                {
                    s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number, submission) " +
                             $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, NULL, @FNum{eventCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.WonTheRun });
                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = character.CharacterId });
                    parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = lastFloor });
                    parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = character.PlayedFloors.Count });
                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Text) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                    parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                    parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                }
            }

            s.Append("COMMIT; ");

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(s.ToString(), c);
            q.Parameters.AddRange(parameters.ToArray());
            await q.ExecuteNonQueryAsync();
        }

        public async Task<NldbVideo?> GetVideoById(string videoId)
        {
            NldbVideo? result = null;
            string query = 
                "SELECT " +
                    "v.id, v.title, v.published AT TIME ZONE 'UTC', v.duration, v.needs_update, v.likes, v.dislikes, v.view_count, v.favorite_count, v.comment_count, v.tags, v.is_3d, v.is_hd, v.cc, " +
                    "t.id, t.url, t.width, t.height " +
                "FROM videos v " +
                "LEFT JOIN thumbnails t ON t.video = v.id " +
                "WHERE v.id = @Id; ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, videoId);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;

                    if (result is null)
                    {
                        result = new NldbVideo()
                        {
                            Id = r.GetString(i++),
                            Title = r.GetString(i++),
                            Published = r.GetDateTime(i++).ToString("F", _formatProvider),
                            Duration = TimeSpan.FromSeconds(r.GetInt32(i++)),
                            RequiresUpdate = r.GetBoolean(i++),
                            Likes = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Dislikes = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            ViewCount = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            FavoriteCount = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            CommentCount = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? new List<string>() : ((string[])r[i - 1]).ToList(),
                            Is3D = r.IsDBNull(i++) ? false : r.GetBoolean(i - 1),
                            IsHD = r.IsDBNull(i++) ? false : r.GetBoolean(i - 1),
                            HasCaption = r.IsDBNull(i++) ? false : r.GetBoolean(i - 1),
                            Submissions = new List<Models.Database.SubmittedEpisode>(),
                            Thumbnails = new List<Models.Database.NldbThumbnail>()
                        };
                    }
                    else i += 14;

                    if (!r.IsDBNull(i) && !result.Thumbnails.Any(x => x.Id == r.GetInt32(i)))
                    {
                        result.Thumbnails.Add(new Models.Database.NldbThumbnail()
                        {
                            Id = r.GetInt32(i++),
                            Url = r.GetString(i++),
                            Width = r.IsDBNull(i++) ? null : (int?) r.GetInt32(i - 1),
                            Height = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1)
                        });
                    }
                }
            }

            return result;
        }

        public async Task<NldbVideo?> GetCompleteEpisode(string videoId)
        {
            var getVideoData = GetVideoById(videoId);
            var getGameplayEventsTask = _isaacRepository.GetGameplayEventsForVideo(videoId);
            var getFloorsTask = _isaacRepository.GetFloorsForVideo(videoId);
            var getPlayedCharactersTask = _isaacRepository.GetPlayedCharactersForVideo(videoId);
            var getSubmittedEpisodesTask = _isaacRepository.GetSubmittedEpisodesForVideo(videoId);

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

        public async Task<NldbVideoResult> GetVideos(GetVideos request)
        {
            var result = new NldbVideoResult()
            {
                AmountPerPage = request.Amount
            };

            var countVideosTask = CountVideos(request);

            var s = new StringBuilder();
            var p = new List<NpgsqlParameter>();

            // SELECT
            s.Append(
                "SELECT" +
                    " v.id, v.title, v.published, v.duration, v.needs_update, v.likes, v.dislikes," +
                    " v.view_count, v.favorite_count, v.comment_count, v.tags, v.is_3d, v.is_hd, v.cc," +
                    " (v.likes::numeric / v.dislikes::numeric) AS like_dislike_ratio," +
                    " COUNT(s.id) AS submission_count");

            // FROM
            s.Append(" FROM videos v");

            // JOIN
            s.Append(" LEFT JOIN video_submissions s ON s.video = v.id");

            // WHERE
            bool requireAnd = false;

            if (RequireWhere(request))
            {
                s.Append(" WHERE");
            }

            if (!string.IsNullOrEmpty(request.Search))
            {
                s.Append(" LOWER(v.title) LIKE LOWER(@Search)");
                requireAnd = true;
                p.Add(new NpgsqlParameter("@Search", NpgsqlDbType.Text) { NpgsqlValue = $"%{request.Search}%" });
            }

            if (request.From != null)
            {
                if (requireAnd)
                {
                    s.Append(" AND");
                }

                s.Append(" v.published >= @From");
                requireAnd = true;
                p.Add(new NpgsqlParameter("@From", NpgsqlDbType.TimestampTz) { NpgsqlValue = request.From.Value });
            }

            if (request.Until != null)
            {
                if (requireAnd)
                {
                    s.Append(" AND");
                }

                s.Append(" v.published <= @Until");
                p.Add(new NpgsqlParameter("@Until", NpgsqlDbType.TimestampTz) { NpgsqlValue = request.Until });
            }

            // GROUP BY
            s.Append(" GROUP BY v.id");

            // ORDER BY
            s.Append(" ORDER BY");

            switch (request.OrderBy)
            {
                case VideoOrderBy.Published: s.Append(" v.published"); break;
                case VideoOrderBy.CommentCount: s.Append(" v.comment_count"); break;
                case VideoOrderBy.Dislikes: s.Append(" v.dislikes"); break;
                case VideoOrderBy.Duration: s.Append(" v.duration"); break;
                case VideoOrderBy.FavoriteCount: s.Append(" v.favorite_count"); break;
                case VideoOrderBy.Id: s.Append(" v.id"); break;
                case VideoOrderBy.Likes: s.Append(" v.likes"); break;
                case VideoOrderBy.LikeDislikeRatio: s.Append(" v.like_dislike_ratio"); break;
                case VideoOrderBy.Title: s.Append(" v.title"); break;
                case VideoOrderBy.ViewCount: s.Append(" v.view_count"); break;
                default: s.Append(" v.published"); break;
            }

            s.Append(request.Asc ? " ASC" : " DESC");

            // LIMIT
            s.Append(" LIMIT @Limit");
            p.Add(new NpgsqlParameter("@Limit", NpgsqlDbType.Integer) { NpgsqlValue = request.Amount });

            // OFFSET
            s.Append(" OFFSET @Offset;");
            p.Add(new NpgsqlParameter("@Offset", NpgsqlDbType.Integer) { NpgsqlValue = request.Amount * (request.Page - 1) });


            // Execute
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(s.ToString(), c);
            q.Parameters.AddRange(p.ToArray());

            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    result.Videos.Add(new NldbVideo()
                    {
                        Id = r.GetString(i++),
                        Title = r.GetString(i++),
                        Published = r.GetDateTime(i++).ToString("F", _formatProvider),
                        Duration = TimeSpan.FromSeconds(r.GetInt32(i++)),
                        RequiresUpdate = r.GetBoolean(i++),
                        Likes = r.IsDBNull(i++) ? (int?)null : r.GetInt32(i - 1),
                        Dislikes = r.IsDBNull(i++) ? (int?)null : r.GetInt32(i - 1),
                        ViewCount = r.IsDBNull(i++) ? (int?)null : r.GetInt32(i - 1),
                        FavoriteCount = r.IsDBNull(i++) ? (int?)null : r.GetInt32(i - 1),
                        CommentCount = r.IsDBNull(i++) ? (int?)null : r.GetInt32(i - 1),
                        Tags = r.IsDBNull(i++) ? new List<string>() : ((string[])r[i++]).ToList(),
                        Is3D = r.IsDBNull(i++) ? false : r.GetBoolean(i - 1),
                        IsHD = r.IsDBNull(i++) ? false : r.GetBoolean(i - 1),
                        HasCaption = r.IsDBNull(i++) ? false : r.GetBoolean(i - 1),
                        Submissions = new List<SubmittedEpisode>(),
                        Thumbnails = new List<NldbThumbnail>(),
                        LikeDislikeRatio = r.IsDBNull(i++) ? 0 : r.GetDecimal(i - 1),
                        SubmissionCount = r.GetInt32(i++)
                    });
                }
            }

            result.VideoCount = await countVideosTask;
            return result;
        }

        public async Task<int> SetThumbnails(ThumbnailDetails thumbnailDetails, string videoId)
        {
            var thumbnails = new List<Thumbnail>();

            if (thumbnailDetails.High != null) thumbnails.Add(thumbnailDetails.High);
            if (thumbnailDetails.Maxres != null) thumbnails.Add(thumbnailDetails.Maxres);
            if (thumbnailDetails.Default__ != null) thumbnails.Add(thumbnailDetails.Default__);
            if (thumbnailDetails.Medium != null) thumbnails.Add(thumbnailDetails.Medium);
            if (thumbnailDetails.Standard != null) thumbnails.Add(thumbnailDetails.Standard);

            if (thumbnails.Count is 0)
            {
                return 0;
            }

            var parameters = new List<NpgsqlParameter>()
            {
                new NpgsqlParameter("@VideoId", NpgsqlDbType.Text) { NpgsqlValue = videoId }
            };

            var s = new StringBuilder();
            s.Append("START TRANSACTION; ");
            s.Append("DELETE FROM thumbnails WHERE video = @VideoId; ");
            s.Append("INSERT INTO thumbnails (id, url, width, height, video) VALUES ");

            int i = 0;
            thumbnails.ForEach(thumb =>
            {
                s.Append($"(DEFAULT, @U{i}, @W{i}, @H{i}, @VideoId), ");
                parameters.Add(new NpgsqlParameter($"@U{i}", NpgsqlDbType.Text) { NpgsqlValue = thumb.Url });
                parameters.Add(new NpgsqlParameter($"@W{i}", NpgsqlDbType.Integer) { NpgsqlValue = thumb.Width ?? (object)DBNull.Value });
                parameters.Add(new NpgsqlParameter($"@H{i++}", NpgsqlDbType.Integer) { NpgsqlValue = thumb.Height ?? (object)DBNull.Value });
            });

            s.Length -= 2;
            s.Append("; ");
            s.Append("COMMIT; ");

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(s.ToString(), c);
            q.Parameters.AddRange(parameters.ToArray());

            return await q.ExecuteNonQueryAsync();
        }
    }
}
