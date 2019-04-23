using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections;
using System.Collections.Generic;
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
        private readonly ITransformationRepository _transformationRepository;
        private readonly IItemRepository _itemRepository;

        public VideoRepository(IDbConnector connector, IModRepository modRepository, ITransformationRepository transformationRepository, IItemRepository itemRepository)
        {
            _connector = connector;
            _modRepository = modRepository;
            _transformationRepository = transformationRepository;
            _itemRepository = itemRepository;
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
            public string Item { get; set; } = string.Empty;
            public string Transformation { get; set; } = string.Empty;
        }

        public async Task SubmitEpisode(SubmittedEpisode episode, string userId, SubmissionType type = SubmissionType.New)
        {
            // check if any mods were used
            var usedMods = await _modRepository.GetUsedModsForSubmittedEpisode(episode);
            var videoReleasedate = await GetVideoReleasedate(episode.VideoId) ?? DateTime.Now;
            var videoTitle = await GetVideoTitle(episode.VideoId) ?? string.Empty;

            // get available transformations, taking mods and video release date into consideration
            var transformationProgress = new List<TransformationProgress>();

            // create submission
            var s = new StringBuilder();
            int characterCounter = 0;
            int floorCounter = 0;
            int itemCounter = 0;
            int bossCounter = 0;
            int deathCounter = 0;
            int curseCounter = 0;
            int actionCounter = 0;
            int experiencedTransformationsCounter = 0;
            int encounteredItemTransformationCounter = 0;

            var parameters = new List<NpgsqlParameter>();

            // save video submission
            s.Append("START TRANSACTION; INSERT INTO video_submissions (video, sub, s_type) VALUES (@V, @S, @ST); ");
            parameters.Add(new NpgsqlParameter("@V", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
            parameters.Add(new NpgsqlParameter("@S", NpgsqlDbType.Text) { NpgsqlValue = userId });
            parameters.Add(new NpgsqlParameter("@ST", NpgsqlDbType.Integer) { NpgsqlValue = (int)type });

            foreach (var character in episode.PlayedCharacters)
            {
                // save character
                s.Append($"INSERT INTO played_characters (game_character, submission, action, video) VALUES (@C{characterCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id')), @Jf{characterCounter}, @Vv{characterCounter}); ");
                parameters.Add(new NpgsqlParameter($"@C{characterCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = character.CharacterId });
                parameters.Add(new NpgsqlParameter($"@Jf{characterCounter}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });
                parameters.Add(new NpgsqlParameter($"@Vv{characterCounter++}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });

                // reset transformation progress
                transformationProgress.Clear();

                foreach (var floor in character.PlayedFloors)
                {
                    // save floor into character
                    s.Append($"INSERT INTO played_floors (floor, played_character, video, action) VALUES (@F{floorCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id')), @Z{floorCounter}, @Je{floorCounter}); ");
                    parameters.Add(new NpgsqlParameter($"@F{floorCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = floor.FloorId });
                    parameters.Add(new NpgsqlParameter($"@Z{floorCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                    parameters.Add(new NpgsqlParameter($"@Je{floorCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });

                    foreach (var e in floor.gameplayEvents)
                    {
                        // save all gameplay events into the floor
                        switch (e.EventType)
                        {
                            case GameplayEventType.CollectedItem:
                            case GameplayEventType.TouchedItem:
                            case GameplayEventType.SkippedItem:
                                // add item
                                s.Append($"INSERT INTO encountered_items (item, source, usage, floor, video, action, played_character) VALUES (@I{itemCounter}, @S{itemCounter}, @A{itemCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), @Q{itemCounter}, @Ja{itemCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@I{itemCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                parameters.Add(new NpgsqlParameter($"@S{itemCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource2 });
                                parameters.Add(new NpgsqlParameter($"@A{itemCounter}", NpgsqlDbType.Integer) { NpgsqlValue = (int)e.EventType });
                                parameters.Add(new NpgsqlParameter($"@Q{itemCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                parameters.Add(new NpgsqlParameter($"@Ja{itemCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });
                                
                                // check if item is part of any transformations
                                var itemTransformationData = await _transformationRepository.ItemCountsTowardsTransformations(e.RelatedResource1, videoTitle, videoReleasedate);

                                // if it does, go through all transformations it's part of
                                foreach (var (transformation, countsMultipleTimes, numberOfItemsRequired) in itemTransformationData)
                                {
                                    // don't process items that don't count multiple times
                                    if (countsMultipleTimes || !transformationProgress.Any(x => x.Transformation == transformation && x.Item == e.RelatedResource1))
                                    {
                                        // add transformation progress to item
                                        transformationProgress.Add(new TransformationProgress() { Item = e.RelatedResource1, Transformation = transformation });
                                        s.Append($"INSERT INTO encountered_items_transformations (encountered_item, transformation, action) VALUES (CURRVAL(pg_get_serial_sequence('encountered_items', 'id')), @EIT{encounteredItemTransformationCounter}, @EIA{encounteredItemTransformationCounter}); ");
                                        parameters.Add(new NpgsqlParameter($"@EIT{encounteredItemTransformationCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = transformation });
                                        parameters.Add(new NpgsqlParameter($"@EIA{encounteredItemTransformationCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });

                                        // check if transformation happened after this item
                                        if (transformationProgress.Count(x => x.Transformation == transformation) == numberOfItemsRequired)
                                        {
                                            s.Append($"INSERT INTO experienced_transformations (transformation, floor, action, video, triggered_by, played_character) VALUES (@ETT{experiencedTransformationsCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), @ETA{experiencedTransformationsCounter}, @ETV{experiencedTransformationsCounter}, CURRVAL(pg_get_serial_sequence('encountered_items', 'id')), CURRVAL(pg_get_serial_sequence('played_characters', 'id'))); ");
                                            parameters.Add(new NpgsqlParameter($"@ETT{experiencedTransformationsCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = transformation });
                                            parameters.Add(new NpgsqlParameter($"@ETA{experiencedTransformationsCounter}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });
                                            parameters.Add(new NpgsqlParameter($"@ETV{experiencedTransformationsCounter++}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                        }
                                    }
                                }
                                break;
                            case GameplayEventType.Bossfight:
                                s.Append($"INSERT INTO bossfights (boss, floor, video, action, played_character) VALUES (@B{bossCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), @R{bossCounter}, @Jb{bossCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@B{bossCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                parameters.Add(new NpgsqlParameter($"@R{bossCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                parameters.Add(new NpgsqlParameter($"@Jb{bossCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });
                                break;
                            case GameplayEventType.CharacterDied:
                                s.Append($"INSERT INTO experienced_deaths (threat, floor, video, action, played_character) VALUES (@D{deathCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), @O{deathCounter}, @Jc{deathCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@D{deathCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                parameters.Add(new NpgsqlParameter($"@O{deathCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                parameters.Add(new NpgsqlParameter($"@Jc{deathCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });
                                break;
                            case GameplayEventType.Curse:
                                s.Append($"INSERT INTO encountered_curses (curse, floor, video, action, played_character) VALUES (@U{curseCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id')), @M{curseCounter}, @Jd{curseCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@U{curseCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                parameters.Add(new NpgsqlParameter($"@M{curseCounter}", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
                                parameters.Add(new NpgsqlParameter($"@Jd{curseCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = actionCounter++ });
                                break;
                        }
                    }
                }

                s.Append("COMMIT; ");
            }

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddRange(parameters.ToArray());
                    int dbChanges = await q.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
