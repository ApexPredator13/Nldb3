using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Services;

namespace Website.Data
{
    public class VideoRepository : IVideoRepository
    {
        private readonly IDbConnector _connector;

        public VideoRepository(IDbConnector connector)
        {
            _connector = connector;
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
            string query = "INSERT INTO video_submissions (video, sub, lost) VALUES (@V, @U, TRUE); ";
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@V", NpgsqlDbType.Char, videoId);
                    q.Parameters.AddWithValue("@U", NpgsqlDbType.Varchar, userId);
                    await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task SubmitEpisode(SubmittedEpisode episode, string userId)
        {
            // create submission
            var s = new StringBuilder();
            int characterCounter = 0;
            int floorCounter = 0;
            int itemCounter = 0;
            int bossCounter = 0;
            int deathCounter = 0;
            int curseCounter = 0;

            var parameters = new List<NpgsqlParameter>();

            s.Append("START TRANSACTION; INSERT INTO video_submissions (video, sub, lost) VALUES (@V, @S, FALSE); ");
            parameters.Add(new NpgsqlParameter("@V", NpgsqlDbType.Char) { NpgsqlValue = episode.VideoId });
            parameters.Add(new NpgsqlParameter("@S", NpgsqlDbType.Text) { NpgsqlValue = userId });

            foreach (var character in episode.PlayedCharacters)
            {
                // save character
                s.Append($"INSERT INTO played_characters (game_character, submission) VALUES (@C{characterCounter}, CURRVAL(pg_get_serial_sequence('video_submissions', 'id'))); ");
                parameters.Add(new NpgsqlParameter($"@C{characterCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = character.CharacterId });

                foreach (var floor in character.PlayedFloors)
                {
                    // save floor into character
                    s.Append($"INSERT INTO played_floors (floor, played_character) VALUES (@F{floorCounter}, CURRVAL(pg_get_serial_sequence('played_characters', 'id'))); ");
                    parameters.Add(new NpgsqlParameter($"@F{floorCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = floor.FloorId });

                    foreach (var e in floor.gameplayEvents)
                    {
                        // save all gameplay events into the floor
                        switch (e.EventType)
                        {
                            case GameplayEventType.DeprecatedCollectedItem:
                                s.Append($"INSERT INTO encountered_items (item, source, usage, floor) VALUES (@I{itemCounter}, @S{itemCounter}, @A{itemCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@I{itemCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                parameters.Add(new NpgsqlParameter($"@S{itemCounter}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource2 });
                                parameters.Add(new NpgsqlParameter($"@A{itemCounter++}", NpgsqlDbType.Integer) { NpgsqlValue = e.SomeAmount });
                                break;
                            case GameplayEventType.Bossfight:
                                s.Append($"INSERT INTO bossfights (boss, floor) VALUES (@B{bossCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@B{bossCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                break;
                            case GameplayEventType.CharacterDied:
                                s.Append($"INSERT INTO experienced_deaths (threat, floor) VALUES (@D{deathCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@D{deathCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
                                break;
                            case GameplayEventType.Curse:
                                s.Append($"INSERT INTO encountered_curses (curse, floor) VALUES (@U{curseCounter}, CURRVAL(pg_get_serial_sequence('played_floors', 'id'))); ");
                                parameters.Add(new NpgsqlParameter($"@U{curseCounter++}", NpgsqlDbType.Varchar) { NpgsqlValue = e.RelatedResource1 });
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
