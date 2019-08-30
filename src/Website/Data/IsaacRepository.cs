using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Areas.Api.Models;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Data
{
    public class IsaacRepository : IIsaacRepository
    {
        private readonly IDbConnector _connector;

        public IsaacRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        private NpgsqlBox CreateBoxCoordinatesFromScreenCoordinates(int x, int y, int w, int h)
            => new NpgsqlBox(-y, x + (w - 1), -y - (h - 1), x);


        public async Task<ResourceType> GetResourceTypeFromId(string id)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT type FROM isaac_resources WHERE id = @Id;", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, id);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                r.Read();
                return (ResourceType)r.GetInt32(0);
            }
            else
            {
                return ResourceType.Unspecified;
            }
        }

        public async Task<List<(int amount, IsaacResource item)>> GetTransformationItemRanking(string transformationId)
        {
            var result = new List<(int amount, IsaacResource item)>();

            var query =
                "SELECT COUNT(e.resource_one) AS item_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN isaac_resources r ON r.id = e.resource_one " +
                "WHERE e.resource_two = @TransformationId " +
                $"AND e.event_type = {(int)GameplayEventType.TransformationProgress} " +
                "GROUP BY r.id " +
                "ORDER BY item_count DESC, r.name ASC;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@TransformationId", NpgsqlDbType.Text, transformationId);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    var amount = r.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = r.GetString(1),
                        Name = r.GetString(2),
                        ResourceType = (ResourceType)r.GetInt32(3),
                        ExistsIn = (ExistsIn)r.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)r.GetValue(5),
                        GameMode = (GameMode)r.GetInt32(6),
                        Color = r.GetString(7),
                        Mod = null,
                        DisplayOrder = r.IsDBNull(8) ? null : (int?)r.GetInt32(8),
                        Difficulty = r.IsDBNull(9) ? null : (int?)r.GetInt32(9),
                        Tags = r.IsDBNull(10) ? null : ((int[])r[10]).Select(x => (Effect)x).ToList()
                    };
                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<List<(int amount, IsaacResource floor)>> GetFloorRanking(string resourceId, int resourceNumber)
        {
            var result = new List<(int amount, IsaacResource floor)>();

            string resourceName = resourceNumber == 1 ? "resource_one" : "resource_two";

            var query =
                "SELECT COUNT(f.id) AS floor_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN played_floors f ON f.id = e.played_floor " +
                "LEFT JOIN isaac_resources r ON r.id = f.floor " +
                $"WHERE e.{resourceName} = @ResourceId " +
                $"GROUP BY r.id " +
                $"ORDER BY floor_count DESC, r.name ASC;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@ResourceId", NpgsqlDbType.Text, resourceId);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    var amount = r.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = r.GetString(1),
                        Name = r.GetString(2),
                        ResourceType = (ResourceType)r.GetInt32(3),
                        ExistsIn = (ExistsIn)r.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)r.GetValue(5),
                        GameMode = (GameMode)r.GetInt32(6),
                        Color = r.GetString(7),
                        Mod = null,
                        DisplayOrder = r.IsDBNull(8) ? null : (int?)r.GetInt32(8),
                        Difficulty = r.IsDBNull(9) ? null : (int?)r.GetInt32(9),
                        Tags = r.IsDBNull(10) ? null : ((int[])r[10]).Select(x => (Effect)x).ToList()
                    };
                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<List<(int amount, IsaacResource curse)>> GetCurseRanking(string resourceId, int resourceNumber)
        {
            var result = new List<(int amount, IsaacResource curse)>();

            string resourceName = resourceNumber == 1 ? "resource_one" : "resource_two";

            var query =
                "SELECT COUNT(c.resource_one) AS curse_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN gameplay_events c ON c.played_floor = e.played_floor " +
                "LEFT JOIN isaac_resources r ON r.id = c.resource_one " +
                $"WHERE e.{resourceName} = @ResourceId " +
                $"AND c.event_type = {((int)GameplayEventType.Curse).ToString()} " +
                "GROUP BY r.id " +
                "ORDER BY curse_count DESC, r.name ASC;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@ResourceId", NpgsqlDbType.Text, resourceId);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while(r.Read())
                {
                    var amount = r.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = r.GetString(1),
                        Name = r.GetString(2),
                        ResourceType = (ResourceType)r.GetInt32(3),
                        ExistsIn = (ExistsIn)r.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)r.GetValue(5),
                        GameMode = (GameMode)r.GetInt32(6),
                        Color = r.GetString(7),
                        Mod = null,
                        DisplayOrder = r.IsDBNull(8) ? null : (int?)r.GetInt32(8),
                        Difficulty = r.IsDBNull(9) ? null : (int?)r.GetInt32(9),
                        Tags = r.IsDBNull(10) ? null : ((int[])r[10]).Select(x => (Effect)x).ToList()
                    };
                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<List<(int amount, IsaacResource characters)>> GetCharacterRanking(string resourceId, int resourceNumber)
        {
            var result = new List<(int amount, IsaacResource character)>();

            string resourceName = resourceNumber == 1 ? "resource_one" : "resource_two";

            var query =
                "SELECT COUNT(pc.game_character) AS gc_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN played_characters pc ON pc.id = e.played_character " +
                "LEFT JOIN isaac_resources r ON pc.game_character = r.id " +
                $"WHERE e.{resourceName} = @ResourceId " +
                "GROUP BY r.id " +
                "ORDER BY gc_count DESC, r.name ASC;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@ResourceId", NpgsqlDbType.Text, resourceId);
            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                while (r.Read())
                {
                    var amount = r.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = r.GetString(1),
                        Name = r.GetString(2),
                        ResourceType = (ResourceType)r.GetInt32(3),
                        ExistsIn = (ExistsIn)r.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)r.GetValue(5),
                        GameMode = (GameMode)r.GetInt32(6),
                        Color = r.GetString(7),
                        Mod = null,
                        DisplayOrder = r.IsDBNull(8) ? null : (int?)r.GetInt32(8),
                        Difficulty = r.IsDBNull(9) ? null : (int?)r.GetInt32(9),
                        Tags = r.IsDBNull(10) ? null : ((int[])r[10]).Select(x => (Effect)x).ToList()
                    };

                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<List<(int amount, IsaacResource foundAt)>> GetFoundAtRanking(string itemId)
        {
            var result = new List<(int amount, IsaacResource foundAt)>();

            var query = 
                "SELECT COUNT(e.resource_two) as r2c, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN isaac_resources r ON r.id = e.resource_two " +
                "WHERE(e.event_type = 2 OR e.event_type = 18) " +
                "AND e.resource_one = @Id " +
                "GROUP BY r.id " +
                "ORDER BY r2c DESC, r.id ASC;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, itemId);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while(r.Read())
                {
                    var amount = r.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = r.GetString(1),
                        Name = r.GetString(2),
                        ResourceType = (ResourceType)r.GetInt32(3),
                        ExistsIn = (ExistsIn)r.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)r.GetValue(5),
                        GameMode = (GameMode)r.GetInt32(6),
                        Color = r.GetString(7),
                        Mod = null,
                        DisplayOrder = r.IsDBNull(8) ? null : (int?)r.GetInt32(8),
                        Difficulty = r.IsDBNull(9) ? null : (int?)r.GetInt32(9),
                        Tags = r.IsDBNull(10) ? null : ((int[])r[10]).Select(x => (Effect)x).ToList()
                    };

                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<string?> GetResourceNameFromId(string id)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT name FROM isaac_resources WHERE id = @Id;", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, id);
            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                r.Read();
                return r.GetString(0);
            }
            else
            {
                return null;
            }
        }

        public async Task<List<DateTime>> GetEncounteredIsaacResourceTimestamps(string isaacResourceId, int resourceNumber, GameplayEventType? eventType = null)
        {
            var result = new List<DateTime>();

            string resourceNumberString = resourceNumber is 1 ? "resource_one" : "resource_two";
            string eventTypeFragment = eventType.HasValue ? "AND event_type = @EventType" : string.Empty;

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand($"SELECT v.published FROM gameplay_events g LEFT JOIN videos v ON v.id = g.video WHERE g.{resourceNumberString} = @Id {eventTypeFragment} ORDER BY v.published ASC;", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, isaacResourceId);
            if (eventType.HasValue)
            {
                q.Parameters.AddWithValue("@EventType", NpgsqlDbType.Integer, (int)eventType.Value);
            }

            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                while (r.Read())
                {
                    result.Add(r.GetDateTime(0));
                }
            }

            return result;
        }

        public async Task<History> GetHistory(SubmittedCompleteEpisode episode)
        {
            if (episode.PlayedCharacters is null || episode.PlayedCharacters.Count is 0)
            {
                return new History();
            }

            var characters = episode.PlayedCharacters.Select(x => x.CharacterId).ToList();
            var floors = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors).Select(x => x.FloorId).ToList();
            var events = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors).SelectMany(x => x.GameplayEvents).Select(x => x.RelatedResource1).ToList();

            var allResources = new List<string>();
            allResources.AddRange(characters);
            allResources.AddRange(floors);
            allResources.AddRange(events);
            allResources = allResources.Distinct().ToList();

            var allImages = new Dictionary<string, IsaacResourceImage>();
            var history = new History();
            var sb = new StringBuilder();
            var p = new List<NpgsqlParameter>();
            sb.Append("SELECT id, x, type FROM isaac_resources WHERE id IN (");

            for (int resource = 0; resource < allResources.Count; resource++)
            {
                p.Add(new NpgsqlParameter($"@R{resource}", NpgsqlDbType.Text) { NpgsqlValue = allResources[resource] });
                sb.Append($"@R{resource}, ");
            }
            sb.Length -= 2;
            sb.Append(");");


            using var con = await _connector.Connect();
            using var q = new NpgsqlCommand(sb.ToString(), con);
            q.Parameters.AddRange(p.ToArray());
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    var box = (NpgsqlBox)r[1];
                    allImages.Add(r.GetString(0), new IsaacResourceImage((int)box.Left, (int)box.Top, (int)box.Height, (int)box.Width, (ResourceType)r.GetInt32(2)));
                }
            }

            for (int c = 0; c < episode.PlayedCharacters.Count; c++)
            {
                history.CharacterHistory.Add(new CharacterHistory());
                history.CharacterHistory[c].CharacterImage = allImages[episode.PlayedCharacters[c].CharacterId];

                for (int f = 0; f < episode.PlayedCharacters[c].PlayedFloors.Count; f++)
                {
                    history.CharacterHistory[c].Floors.Add(new FloorHistory());
                    history.CharacterHistory[c].Floors[f].FloorImage = allImages[episode.PlayedCharacters[c].PlayedFloors[f].FloorId];

                    for (int e = 0; e < episode.PlayedCharacters[c].PlayedFloors[f].GameplayEvents.Count; e++)
                    {
                        history.CharacterHistory[c].Floors[f].Events.Add(new EventHistory());
                        history.CharacterHistory[c].Floors[f].Events[e].Image = allImages[episode.PlayedCharacters[c].PlayedFloors[f].GameplayEvents[e].RelatedResource1];
                    }
                }
            }

            return history;
        }

        public async Task<bool> CoordinatesAreTaken(int x, int y, int h, int w)
        {
            var query = "SELECT 1 FROM isaac_resources WHERE x && @X IS TRUE;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@X", NpgsqlDbType.Box, CreateBoxCoordinatesFromScreenCoordinates(x, y, w, h));

            using var r = await q.ExecuteReaderAsync();

            return r.HasRows;
        }

        public async Task<List<SubmittedEpisode>> GetSubmittedEpisodesForVideo(string videoId, int? submissionId = null)
        {
            var result = new List<SubmittedEpisode>();

            string query = 
                "SELECT s.id, s.s_type, s.latest, u.\"UserName\" " +
                "FROM public.video_submissions s " +
                "LEFT JOIN public.video_submissions_userdata d ON d.submission = s.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "WHERE s.video = @VideoId" +
                $"{(submissionId is null ? string.Empty : " AND id = @SubmissionId")}; ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) q.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    var e = new SubmittedEpisode();
                    e.Id = r.GetInt32(i++);
                    e.SubmissionType = (SubmissionType)r.GetInt32(i++);
                    e.Latest = r.GetBoolean(i++);
                    e.PlayedCharacters = new List<PlayedCharacter>();
                    e.Video = videoId;
                    e.UserName = r.IsDBNull(i++) ? "[unknown]" : r.GetString(i - 1);
                    result.Add(e);
                }
            }

            return result;
        }

        public async Task<List<PlayedCharacter>>GetPlayedCharactersForVideo(string videoId, int? submissionId = null)
        {
            var result = new List<PlayedCharacter>();

            string query = 
                "SELECT " +
                    "pc.id, pc.action, pc.run_number, pc.submission, pc.seed, " +
                    "c.id, c.name, c.type, c.exists_in, c.x, c.game_mode, c.color, c.display_order, c.difficulty, c.tags, " +
                    "d.id, d.name, d.type, d.exists_in, d.x, d.game_mode, d.color, d.display_order, d.difficulty, d.tags " +
                "FROM played_characters pc " +
                "LEFT JOIN isaac_resources c ON c.id = pc.game_character " +
                "LEFT JOIN isaac_resources d ON d.id = pc.died_from " +
                $"WHERE pc.video = @VideoId{(submissionId is null ? string.Empty : " AND pc.submission = @SubmissionId")} " +
                "GROUP BY pc.submission, pc.id, c.id, d.id " +
                "ORDER BY pc.run_number ASC, pc.action ASC; ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) q.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    var playedCharacter = new PlayedCharacter();
                    playedCharacter.Id = r.GetInt32(i++);
                    playedCharacter.Action = r.GetInt32(i++);
                    playedCharacter.RunNumber = r.GetInt32(i++);
                    playedCharacter.Submission = r.GetInt32(i++);
                    playedCharacter.Seed = r.IsDBNull(i++) ? null : r.GetString(i - 1);
                    playedCharacter.GameCharacter = new IsaacResource();
                    playedCharacter.GameCharacter.Id = r.GetString(i++);
                    playedCharacter.GameCharacter.Name = r.GetString(i++);
                    playedCharacter.GameCharacter.ResourceType = (ResourceType)r.GetInt32(i++);
                    playedCharacter.GameCharacter.ExistsIn = (ExistsIn)r.GetInt32(i++);
                    playedCharacter.GameCharacter.CssCoordinates = (NpgsqlBox)r[i++];
                    playedCharacter.GameCharacter.GameMode = (GameMode)r.GetInt32(i++);
                    playedCharacter.GameCharacter.Color = r.GetString(i++);
                    playedCharacter.GameCharacter.DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1);
                    playedCharacter.GameCharacter.Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1);
                    playedCharacter.GameCharacter.Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList();
                    

                    if (!r.IsDBNull(i))
                    {
                        playedCharacter.DiedFrom = new IsaacResource()
                        {
                            Id = r.GetString(i++),
                            Name = r.GetString(i++),
                            ResourceType = (ResourceType)r.GetInt32(i++),
                            ExistsIn = (ExistsIn)r.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)r[i++],
                            GameMode = (GameMode)r.GetInt32(i++),
                            Color = r.GetString(i++),
                            DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList()
                        };
                    }

                    result.Add(playedCharacter);
                }
            }

            return result;
        }

        public async Task<List<PlayedFloor>> GetFloorsForVideo(string videoId, int? submissionId = null)
        {
            var result = new List<PlayedFloor>();

            string query =
                "SELECT " +
                    "pf.id, pf.action, pf.run_number, pf.floor_number, pf.submission, pf.duration, " +
                    "f.id, f.name, f.type, f.exists_in, f.x, f.game_mode, f.color, f.display_order, f.difficulty, f.tags, " +
                    "d.id, d.name, d.type, d.exists_in, d.x, d.game_mode, d.color, d.display_order, d.difficulty, d.tags " +
                "FROM played_floors pf " +
                "LEFT JOIN isaac_resources f ON f.id = pf.floor " +
                "LEFT JOIN isaac_resources d ON d.id = pf.died_from " +
                $"WHERE pf.video = @VideoId{(submissionId is null ? string.Empty : " AND pf.submission = @SubmissionId")} " +
                "GROUP BY pf.id, f.id, d.id " +
                "ORDER BY pf.run_number ASC, pf.action ASC; ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) q.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    var floor = new PlayedFloor()
                    {
                        Id = r.GetInt32(i++),
                        Action = r.GetInt32(i++),
                        RunNumber = r.GetInt32(i++),
                        FloorNumber = r.GetInt32(i++),
                        Submission = r.GetInt32(i++),
                        Duration = r.GetInt32(i++),
                        Floor = new IsaacResource()
                        {
                            Id = r.GetString(i++),
                            Name = r.GetString(i++),
                            ResourceType = (ResourceType)r.GetInt32(i++),
                            ExistsIn = (ExistsIn)r.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)r[i++],
                            GameMode = (GameMode)r.GetInt32(i++),
                            Color = r.GetString(i++),
                            DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList()
                        }
                    };

                    if (!r.IsDBNull(i))
                    {
                        floor.DiedFrom = new IsaacResource()
                        {
                            Id = r.GetString(i++),
                            Name = r.GetString(i++),
                            ResourceType = (ResourceType)r.GetInt32(i++),
                            ExistsIn = (ExistsIn)r.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)r[i++],
                            GameMode = (GameMode)r.GetInt32(i++),
                            Color = r.GetString(i++),
                            DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList()
                        };
                    }

                    result.Add(floor);
                }
            }

            return result;
        }

        public async Task<List<GameplayEvent>> GetGameplayEventsForVideo(string videoId, int? submissionId = null)
        {
            var result = new List<GameplayEvent>();

            var query =
                "SELECT " +
                    "e.id, e.event_type, e.action, e.resource_three, e.run_number, e.player, e.floor_number, e.submission, " +
                    "r1.id, r1.name, r1.type, r1.exists_in, r1.x, r1.game_mode, r1.color, r1.display_order, r1.difficulty, r1.tags, " +
                    "r2.id, r2.name, r2.type, r2.exists_in, r2.x, r2.game_mode, r2.color, r2.display_order, r2.difficulty, r2.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN isaac_resources r1 ON r1.id = e.resource_one " +
                "LEFT JOIN isaac_resources r2 ON r2.id = e.resource_two " +
                $"WHERE e.video = @VideoId{(submissionId is null ? string.Empty : " AND e.submission = @SubmissionId")} " +
                "GROUP BY e.submission, e.id, r1.id, r2.id " +
                "ORDER BY e.run_number ASC, e.action ASC;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) q.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    var gameplayEvent = new GameplayEvent()
                    {
                        Id = r.GetInt32(i++),
                        EventType = (GameplayEventType)r.GetInt32(i++),
                        Action = r.GetInt32(i++),
                        Resource3 = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                        RunNumber = r.GetInt32(i++),
                        Player = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                        FloorNumber = r.GetInt32(i++),
                        Submission = r.GetInt32(i++),
                        Resource1 = new IsaacResource()
                        {
                            Id = r.GetString(i++),
                            Name = r.GetString(i++),
                            ResourceType = (ResourceType)r.GetInt32(i++),
                            ExistsIn = (ExistsIn)r.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)r[i++],
                            GameMode = (GameMode)r.GetInt32(i++),
                            Color = r.GetString(i++),
                            DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList()
                        }
                    };

                    if (!r.IsDBNull(i))
                    {
                        gameplayEvent.Resource2 = new IsaacResource()
                        {
                            Id = r.GetString(i++),
                            Name = r.GetString(i++),
                            ResourceType = (ResourceType)r.GetInt32(i++),
                            ExistsIn = (ExistsIn)r.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)r[i++],
                            GameMode = (GameMode)r.GetInt32(i++),
                            Color = r.GetString(i++),
                            DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList()
                        };
                    }

                    result.Add(gameplayEvent);
                }
            }

            return result;
        }

        public async Task<int> UpdateExistsIn(string id, ExistsIn newExistsIn)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET exists_in = @E WHERE id = @I;", c);
            q.Parameters.AddWithValue("@E", NpgsqlDbType.Integer, (int)newExistsIn);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Text, id);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<int> UpdateGameMode(string id, GameMode newGameMode)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET game_mode = @G WHERE id = @I;", c);
            q.Parameters.AddWithValue("@G", NpgsqlDbType.Integer, (int)newGameMode);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Text, id);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<int> UpdateName(string id, string newName)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET name = @N WHERE id = @I;", c);
            q.Parameters.AddWithValue("@N", NpgsqlDbType.Text, newName);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Text, id);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<int> UpdateId(string oldId, string newId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET id = @NewId WHERE id = @OldId;", c);
            q.Parameters.AddWithValue("@NewId", NpgsqlDbType.Text, newId);
            q.Parameters.AddWithValue("@OldId", NpgsqlDbType.Text, oldId);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<int> CountResources(ResourceType type = ResourceType.Unspecified)
        {
            string query = type == ResourceType.Unspecified
                ? "SELECT COUNT(*) FROM isaac_resources;"
                : "SELECT COUNT(*) FROM isaac_resources WHERE type = @Type;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);

            if (type != ResourceType.Unspecified)
            {
                q.Parameters.AddWithValue("@Type", NpgsqlDbType.Integer, (int)type);
            }

            var result = Convert.ToInt32(await q.ExecuteScalarAsync());
            return result;
        }

        public async Task<string?> GetFirstResourceIdFromName(string name)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("SELECT id FROM isaac_resources WHERE name = @Name", c);
            q.Parameters.AddWithValue("@Name", NpgsqlDbType.Text, name);
            return Convert.ToString(await q.ExecuteScalarAsync());
        }

        public async Task<string?> SaveResource(CreateIsaacResource resource, int x, int y, int w, int h)
        {
            Console.WriteLine("Saving Resource " + resource.Id);
            string query = "INSERT INTO isaac_resources (id, name, type, exists_in, x, game_mode, color, mod, display_order, difficulty, tags) VALUES (" +
                "@I, @N, @D, @E, @X, @M, @C, @L, @O, @U, @T) RETURNING id;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Text, resource.Id);
            q.Parameters.AddWithValue("@N", NpgsqlDbType.Text, resource.Name);
            q.Parameters.AddWithValue("@D", NpgsqlDbType.Integer, (int)resource.ResourceType);
            q.Parameters.AddWithValue("@E", NpgsqlDbType.Integer, (int)resource.ExistsIn);
            q.Parameters.AddWithValue("@X", NpgsqlDbType.Box, CreateBoxCoordinatesFromScreenCoordinates(x, y, w, h));
            q.Parameters.AddWithValue("@M", NpgsqlDbType.Integer, (int)resource.GameMode);
            q.Parameters.AddWithValue("@C", NpgsqlDbType.Text, resource.Color);
            q.Parameters.AddWithValue("@L", NpgsqlDbType.Integer, resource.FromMod ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@O", NpgsqlDbType.Integer, resource.DisplayOrder ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Integer, resource.Difficulty ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@T", NpgsqlDbType.Array | NpgsqlDbType.Integer, resource.Tags?.Select(x => (int)x).ToArray() ?? (object)DBNull.Value);

            return Convert.ToString(await q.ExecuteScalarAsync());
        }

        public async Task<int> UpdateIconCoordinates(string resourceId, int x, int y, int w, int h)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET x = @X WHERE id = @I;", c);
            q.Parameters.AddWithValue("@X", NpgsqlDbType.Box, CreateBoxCoordinatesFromScreenCoordinates(x, y, w, h));
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Text, resourceId);
            return await q.ExecuteNonQueryAsync();
        }

        private string GetOrderByClause(ResourceOrderBy orderBy, string prefix, bool asc)
        {
            return orderBy switch
            {
                ResourceOrderBy.Color => $"{prefix}.color {(asc ? "ASC" : "DESC")}",
                ResourceOrderBy.Difficulty => $"{prefix}.difficulty {(asc ? "ASC" : "DESC")} NULLS LAST",
                ResourceOrderBy.DisplayOrder => $"{prefix}.display_order {(asc ? "ASC" : "DESC")} NULLS LAST",
                ResourceOrderBy.ExistsIn => $"{prefix}.exists_in {(asc ? "ASC" : "DESC")}",
                ResourceOrderBy.GameMode => $"{prefix}.game_mode {(asc ? "ASC" : "DESC")}",
                ResourceOrderBy.Id => $"{prefix}.id {(asc ? "ASC" : "DESC")}",
                ResourceOrderBy.Name => $"{prefix}.name {(asc ? "ASC" : "DESC")}",
                ResourceOrderBy.Type => $"{prefix}.type {(asc ? "ASC" : "DESC")}",
                _ => $"{prefix}.id",
            };
        }

        #region StatementCreatorsForGetResources

        private void CreateSelectStatementForRequest(StringBuilder s, GetResource request)
        {
            s.Append($"SELECT i.id, i.name, i.type, i.exists_in, i.x, i.game_mode, i.color, i.display_order, i.difficulty, i.tags");

            if (request.IncludeMod)
            {
                s.Append($", m.id, m.name, u.id, u.url, u.name");
            }
        }

        private void CreateFromAndJoinStatementFromRequest(StringBuilder s, GetResource request)
        {
            s.Append(" FROM isaac_resources i");

            if (request.IncludeMod)
            {
                s.Append(" LEFT JOIN mods m ON i.mod = m.id");
                s.Append(" LEFT JOIN mod_url u ON m.id = u.mod");
            }
        }

        private List<NpgsqlParameter> CreateWhereStatementForRequest(StringBuilder s, GetResource request)
        {
            var parameters = new List<NpgsqlParameter>();

            if (request.ResourceType == ResourceType.Unspecified && request.RequiredTags.Count is 0)
            {
                return parameters;
            }

            s.Append(" WHERE");
            bool needAnd = false;

            if (request.ResourceType != ResourceType.Unspecified)
            {
                needAnd = true;
                s.Append(" i.type = @T");
                parameters.Add(new NpgsqlParameter("@T", NpgsqlDbType.Integer) { NpgsqlValue = (int)request.ResourceType });
            }
            
            if (request.RequiredTags.Count > 0)
            {
                if (needAnd)
                {
                    s.Append(" AND");
                }

                s.Append(" i.tags @> @R");
                parameters.Add(new NpgsqlParameter("@R", NpgsqlDbType.Array | NpgsqlDbType.Integer) { NpgsqlValue = request.RequiredTags.Select(x => (int)x).ToArray() });
            }

            return parameters;
        }

        private void CreateGroupByStatementForRequest(StringBuilder s, GetResource request)
        {
            s.Append(" GROUP BY i.id");

            if (request.IncludeMod)
            {
                s.Append(", m.id, u.id");
            }
        }

        private void CreateOrderByStatementForRequest(StringBuilder s, GetResource request)
        {
            if (request.OrderBy1 != ResourceOrderBy.Unspecified)
            {
                s.Append($" ORDER BY {GetOrderByClause(request.OrderBy1, "i", request.Asc)}");
            }
            if (request.OrderBy2 != ResourceOrderBy.Unspecified)
            {
                s.Append($", {GetOrderByClause(request.OrderBy2, "i", request.Asc)}");
            }
        }

        #endregion

        public async Task<List<IsaacResource>> GetResources(GetResource request)
        {
            var resources = new List<IsaacResource>();
            var parameters = new List<NpgsqlParameter>();

            var s = new StringBuilder();

            CreateSelectStatementForRequest(s, request);
            CreateFromAndJoinStatementFromRequest(s, request);
            parameters.AddRange(CreateWhereStatementForRequest(s, request));
            CreateGroupByStatementForRequest(s, request);
            CreateOrderByStatementForRequest(s, request);

            // ...Execute
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(s.ToString(), c);
            q.Parameters.AddRange(parameters.ToArray());

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    var resourceId = r.GetString(i);
                    if (!resources.Any(x => x.Id == resourceId))
                    {
                        resources.Add(new IsaacResource()
                        {
                            Id = r.GetString(i++),
                            Name = r.GetString(i++),
                            ResourceType = (ResourceType)r.GetInt32(i++),
                            ExistsIn = (ExistsIn)r.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)r[i++],
                            GameMode = (GameMode)r.GetInt32(i++),
                            Color = r.GetString(i++),
                            DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList()
                        });
                    }
                    else i += 10;

                    var currentResource = resources.First(x => x.Id == resourceId);

                    if (request.IncludeMod)
                    {
                        if (!r.IsDBNull(i) && currentResource.Mod is null)
                        {
                            resources.First(x => x.Id == resourceId).Mod = new Mod()
                            {
                                Id = r.GetInt32(i++),
                                ModName = r.GetString(i++),
                            };
                        }
                        else i += 2;

                        if (!r.IsDBNull(i) && currentResource.Mod != null && !currentResource.Mod!.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                        {
                            currentResource.Mod!.ModUrls.Add(new ModUrl()
                            {
                                Id = r.GetInt32(i++),
                                Url = r.GetString(i++),
                                LinkText = r.GetString(i++)
                            });
                        }
                        else i += 3;
                    }
                }
            }

            return resources;
        }

        public async Task<IsaacResource?> GetResourceById(string id, bool includeMod)
        {
            IsaacResource? result = null;

            var s = new StringBuilder();
            s.Append($"SELECT i.id, i.name, i.type, i.exists_in, i.x, i.game_mode, i.color, i.display_order, i.difficulty, i.tags");

            if (includeMod)
            {
                s.Append($", m.id, m.name, u.id, u.url, u.name");
            }

            s.Append(" FROM isaac_resources i");

            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON i.mod = m.id");
                s.Append(" LEFT JOIN mod_url u ON m.id = u.mod");
            }

            s.Append(" WHERE i.id = @Id; ");

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(s.ToString(), c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, id);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    if (result is null)
                    {
                        result = new IsaacResource()
                        {
                            Id = r.GetString(i++),
                            Name = r.GetString(i++),
                            ResourceType = (ResourceType)r.GetInt32(i++),
                            ExistsIn = (ExistsIn)r.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)r[i++],
                            GameMode = (GameMode)r.GetInt32(i++),
                            Color = r.GetString(i++),
                            DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                            Tags = r.IsDBNull(i++) ? null : ((int[])r[i - 1]).Select(x => (Effect)x).ToList()
                        };
                    }
                    else i += 10;

                    if (includeMod)
                    {
                        if (!r.IsDBNull(i) && result.Mod is null)
                        {
                            result.Mod = new Mod()
                            {
                                Id = r.GetInt32(i++),
                                ModName = r.GetString(i++),
                            };
                        }
                        else i += 2;

                        if (!r.IsDBNull(i) && result.Mod != null && !result.Mod.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                        {
                            result.Mod.ModUrls.Add(new ModUrl()
                            {
                                Id = r.GetInt32(i++),
                                Url = r.GetString(i++),
                                LinkText = r.GetString(i++)
                            });
                        }
                        else i += 3;
                    }
                }
            }

            return result;
        }


        public async Task<int> DeleteResource(string resourceId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("DELETE FROM isaac_resources WHERE id = @Id; ", c);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, resourceId);
            return await q.ExecuteNonQueryAsync();
        }


        public async Task<int> MakeTransformative(MakeIsaacResourceTransformative model)
        {
            string query =
                "INSERT INTO transformative_resources (id, isaac_resource, transformation, counts_multiple_times, requires_title_content, valid_from, valid_until, steps_needed) " +
                $"VALUES (DEFAULT, @IR, @TR, @CM, @RT, {(model.ValidFrom.HasValue ? "@VF" : "DEFAULT")}, {(model.ValidUntil.HasValue ? "@VU" : "DEFAULT")}, @SN) RETURNING id;";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@IR", NpgsqlDbType.Text, model.ResourceId);
            q.Parameters.AddWithValue("@TR", NpgsqlDbType.Text, model.TransformationId);
            q.Parameters.AddWithValue("@CM", NpgsqlDbType.Boolean, model.CanCountMultipleTimes);
            q.Parameters.AddWithValue("@RT", NpgsqlDbType.Text, model.RequiresTitleContent ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@SN", NpgsqlDbType.Integer, model.StepsNeeded);
            if (model.ValidFrom.HasValue) q.Parameters.AddWithValue("@VF", NpgsqlDbType.TimestampTz, model.ValidFrom ?? (object)DBNull.Value);
            if (model.ValidUntil.HasValue) q.Parameters.AddWithValue("@VU", NpgsqlDbType.TimestampTz, model.ValidUntil ?? (object)DBNull.Value);

            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<bool> HasTags(string resourceId, params Effect[] effects)
        {
            bool hasEffects = false;

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand($"SELECT 1 FROM isaac_resources WHERE id = @Resource AND tags @> @RequiredEffects; ", c);
            q.Parameters.AddWithValue("@Resource", NpgsqlDbType.Text, resourceId);
            q.Parameters.AddWithValue("@RequiredEffects", NpgsqlDbType.Array | NpgsqlDbType.Integer, effects.Select(x => (int)x).ToArray());

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                hasEffects = true;
            }

            return hasEffects;
        }

        public async Task<List<(string transformation, bool countsMultipleTimes, int stepsNeeded)>> GetTransformationData(string resourceId, string videoTitle, DateTime videoReleasedate)
        {
            var result = new List<(string, bool, int)>();

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(
                "SELECT t.isaac_resource, t.transformation, t.counts_multiple_times, t.requires_title_content, t.valid_from, t.valid_until, t.steps_needed " +
                "FROM transformative_resources t " +
                "WHERE isaac_resource = @I " +
                "AND valid_from <= @R " +
                "AND valid_until >= @R; ", c);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Text, resourceId);
            q.Parameters.AddWithValue("@R", NpgsqlDbType.TimestampTz, videoReleasedate);

            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    string? requiredTitleContent = r.IsDBNull(3) ? null : r.GetString(3);

                    if (requiredTitleContent != null && !videoTitle.ToLower().Contains(requiredTitleContent.ToLower()))
                    {
                        continue;
                    }

                    result.Add((r.GetString(1), r.GetBoolean(2), r.GetInt32(6)));
                }
            }

            return result;
        }

        public async Task<int> AddTag(string id, Effect tag)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET tags = tags || ARRAY[@T] WHERE id = @Id;", c);
            q.Parameters.AddWithValue("@T", NpgsqlDbType.Integer, (int)tag);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, id);
            return await q.ExecuteNonQueryAsync();
        }

        public List<AvailableStats> GetAvailableStats(IsaacResource resource)
        {
            return resource.ResourceType switch
            {
                ResourceType.Boss => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Character => new List<AvailableStats>() { AvailableStats.Curse, AvailableStats.History },
                ResourceType.CharacterReroll => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Curse => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Enemy => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Floor => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History },
                ResourceType.Item => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.FoundAt, AvailableStats.History, AvailableStats.Floor },
                ResourceType.ItemSource => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.OtherConsumable => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.OtherEvent => new List<AvailableStats>() { AvailableStats.History },
                ResourceType.Pill => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Rune => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.TarotCard => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Transformation => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor, AvailableStats.TransformationItemRanking },
                ResourceType.Trinket => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                _ => new List<AvailableStats>(),
            };
        }

        public int GetResourceNumber(IsaacResource resource)
            => GetResourceNumber(resource.ResourceType);

        public int GetResourceNumber(ResourceType resourceType) 
            => resourceType switch
            {
                ResourceType.Transformation => 2,
                ResourceType.ItemSource => 2,
                _ => 1
            };

        public async Task<int> UpdateColor(ChangeColor changeColor)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET color = @Color WHERE id = @Id;", c);
            q.Parameters.AddWithValue("@Color", NpgsqlDbType.Text, changeColor.Color);
            q.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, changeColor.ResourceId);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<int> UpdateMod(ChangeMod changeMod)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("UPDATE isaac_resources SET mod = @ModId WHERE id = @ResourceId;", c);
            q.Parameters.AddWithValue("@ModId", NpgsqlDbType.Integer, changeMod.ModId ?? (object)DBNull.Value);
            q.Parameters.AddWithValue("@ResourceId", NpgsqlDbType.Text, changeMod.ResourceId);
            return await q.ExecuteNonQueryAsync();
        }
    }
}
