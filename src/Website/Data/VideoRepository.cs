using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Models.Validation.SubmitEpisode;
using Website.Services;

namespace Website.Data
{
    public class VideoRepository : IVideoRepository
    {
        private readonly IDbConnector _connector;
        private readonly IModRepository _modRepository;
        private readonly IIsaacRepository _isaacRepository;

        public VideoRepository(IDbConnector connector, IModRepository modRepository, IIsaacRepository isaacRepository)
        {
            _connector = connector;
            _modRepository = modRepository;
            _isaacRepository = isaacRepository;
        }

        public async Task<int> CountVideos()
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT COUNT(*) FROM videos; ", c))
                {
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<DateTime?> GetVideoReleasedate(string videoId)
        {
            DateTime? result = null;
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT published FROM videos WHERE id = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Char, videoId);
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            r.Read();
                            result = r.GetDateTime(0);
                        }
                    }
                }
            }

            return result;
        }

        public async Task<string?> GetVideoTitle(string videoId)
        {
            string? result = null;

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT title FROM videos WHERE id = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Char, videoId);
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            r.Read();
                            result = r.GetString(0);
                        }
                    }
                }
            }

            return result;
        }

        public async Task<int> CountVideoSubmissions()
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT COUNT(*) FROM video_submissions; ", c))
                {
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task SaveVideo(SaveVideo newVideo)
        {
            string query = "INSERT INTO videos (id, title, published, duration) VALUES (@I, @T, @P, @D); ";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, newVideo.Id);
                    q.Parameters.AddWithValue("@T", NpgsqlDbType.Varchar, newVideo.Title);
                    q.Parameters.AddWithValue("@P", NpgsqlDbType.TimestampTz, newVideo.Published);
                    q.Parameters.AddWithValue("@D", NpgsqlDbType.Integer, newVideo.Duration);

                    await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task SubmitLostEpisode(string videoId, string userId)
        {
            string query = $"INSERT INTO video_submissions (video, sub, s_type) VALUES (@V, @U, @ST); ";
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@V", NpgsqlDbType.Char, videoId);
                    q.Parameters.AddWithValue("@U", NpgsqlDbType.Varchar, userId);
                    q.Parameters.AddWithValue("@ST", NpgsqlDbType.Integer, (int)SubmissionType.Lost);
                    await q.ExecuteNonQueryAsync();
                }
            }
        }

        public class TransformationProgress
        {
            public string Resource { get; set; } = string.Empty;
            public string Transformation { get; set; } = string.Empty;
        }

        public async Task SubmitEpisode(SubmittedEpisode episode, string userId, SubmissionType type = SubmissionType.New)
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
            s.Append("START TRANSACTION; INSERT INTO video_submissions (video, sub, s_type) VALUES (@Video, @Sub, @Type); ");
            parameters.Add(new NpgsqlParameter("@Video", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
            parameters.Add(new NpgsqlParameter("@Sub", NpgsqlDbType.Text) { NpgsqlValue = userId });
            parameters.Add(new NpgsqlParameter("@Type", NpgsqlDbType.Integer) { NpgsqlValue = (int)type });

            foreach (var character in episode.PlayedCharacters)
            {
                // reset run
                runNumber++;
                currentFloorNumber = 0;
                gameplayAction = 0;
                transformationProgress.Clear();
                lastDeath = null;

                // save character
                s.Append($"INSERT INTO played_characters (game_character, submission, action, video, run_number, died_from) VALUES (@CCharacter{characterCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id')), @CAction{characterCounter}, @CVideo{characterCounter}, @CRunNumber{characterCounter}, NULL); ");
                parameters.Add(new NpgsqlParameter($"@CCharacter{characterCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = character.CharacterId });
                parameters.Add(new NpgsqlParameter($"@CAction{characterCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                parameters.Add(new NpgsqlParameter($"@CVideo{characterCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                parameters.Add(new NpgsqlParameter($"@CRunNumber{characterCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });

                foreach (var floor in character.PlayedFloors)
                {
                    currentFloorNumber++;
                    lastFloor = floor.FloorId;

                    // save floor into character
                    s.Append($"INSERT INTO played_floors (floor, played_character, video, action, run_number, floor_number, died_from) VALUES (@FFloor{floorCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @FVideo{floorCounter}, @FAction{floorCounter}, @FRunNum{floorCounter}, @FCurrF{floorCounter}, NULL); ");
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
                        s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number) " +
                                 $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}); ");
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
                                    transformationProgress.Add(new TransformationProgress() { Resource = e.RelatedResource1, Transformation = transformation });
                                    s.Append("INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number) VALUES ");
                                    s.Append($"(@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, @Three{eventCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, CURRVAL(pg_get_serial_sequence('gameplay_events', 'id')) - {subtractFromSequence++}, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}); ");
                                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.TransformationProgress });
                                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                    parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = transformation });
                                    parameters.Add(new NpgsqlParameter($"@Three{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = transformationProgress.Count(x => x.Transformation == transformation) });
                                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                    parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                                    parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                                    parameters.Add(new NpgsqlParameter($"@Player{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.Player ?? (object)DBNull.Value });
                                    parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });

                                    // check if transformation happened after this item
                                    if (transformationProgress.Count(x => x.Transformation == transformation) == numberOfItemsRequired)
                                    {
                                        s.Append("INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number) VALUES ");
                                        s.Append($"(@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, NULL, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, CURRVAL(pg_get_serial_sequence('gameplay_events', 'id')) - {subtractFromSequence++}, @RunNumber{eventCounter}, @Player{eventCounter}, @FNum{eventCounter}); ");
                                        parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.TransformationComplete });
                                        parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                        parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = transformation });
                                        parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                        parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                                        parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                                        parameters.Add(new NpgsqlParameter($"@Player{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = e.Player ?? (object)DBNull.Value });
                                        parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                                    }
                                }
                            }
                        }


                        // remove trailing slash and finish statement
                        s.Length -= 2;
                        s.Append("; ");
                        
                    }


                    // STEP 3 - down to the next floor
                    s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number) " +
                             $"VALUES (@Type{eventCounter}, @One{eventCounter}, NULL, NULL, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, NULL, @FNum{eventCounter}); ");
                    parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.DownToTheNextFloor });
                    parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = floor.FloorId });
                    parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                    parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                    parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });
                }

                // STEP 4 - save last floor
                s.Append($"INSERT INTO gameplay_events (event_type, resource_one, resource_two, resource_three, played_floor, played_character, video, action, in_consequence_of, run_number, player, floor_number) " +
                             $"VALUES (@Type{eventCounter}, @One{eventCounter}, @Two{eventCounter}, NULL, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Video{eventCounter}, @Action{eventCounter}, NULL, @RunNumber{eventCounter}, NULL, @FNum{eventCounter}); ");
                parameters.Add(new NpgsqlParameter($"@Type{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)GameplayEventType.TransformationComplete });
                parameters.Add(new NpgsqlParameter($"@One{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = lastFloor });
                parameters.Add(new NpgsqlParameter($"@Two{eventCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = lastDeath ?? (object)DBNull.Value });
                parameters.Add(new NpgsqlParameter($"@Video{eventCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                parameters.Add(new NpgsqlParameter($"@Action{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = gameplayAction++ });
                parameters.Add(new NpgsqlParameter($"@RunNumber{eventCounter}", NpgsqlDbType.Integer) { NpgsqlValue = runNumber });
                parameters.Add(new NpgsqlParameter($"@FNum{eventCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = currentFloorNumber });

                // STEP 5 - save death to character and floor
                if (!string.IsNullOrEmpty(lastDeath))
                {
                    s.Append($"UPDATE played_characters SET died_from = @CDF{characterDeathCounter} WHERE id = CURRVAL(pg_get_serial_sequence('played_characters', 'id')); ");
                    parameters.Add(new NpgsqlParameter($"@CDF{characterDeathCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = lastDeath });

                    s.Append($"UPDATE played_floors SET died_from = @FDF{floorDeathCounter} WHERE id = CURRVAL(pg_get_serial_sequence('played_floors', 'id')); ");
                    parameters.Add(new NpgsqlParameter($"@FDF{floorDeathCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = lastDeath });
                }
                
            }

            s.Append("COMMIT; ");

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddRange(parameters.ToArray());


                    try
                    {
                        int dbChanges = await q.ExecuteNonQueryAsync();
                    }
                    catch (Exception e)
                    {
                        await File.WriteAllLinesAsync(@"E:\OneDrive\Desktop\SQLTESTGAGA.txt", q.Statements.Select(x => x.SQL));
                        var x = Convert.ToInt32(e.Data["Position"]);
                        var pos = string.Concat(q.Statements.Select(x => x.SQL + "; "));
                        var y = pos.Substring(x - 100, 200);
                        throw e;
                    }
                }
            }
        }
    }
}
