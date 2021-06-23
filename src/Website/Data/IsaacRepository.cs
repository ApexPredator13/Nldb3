using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Admin;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Resource;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Data
{
    public class IsaacRepository : IIsaacRepository
    {
        private readonly INpgsql _npgsql;

        public IsaacRepository(INpgsql npgsql)
        {
            _npgsql = npgsql;
        }

        private NpgsqlBox CreateBoxCoordinatesFromScreenCoordinates(int x, int y, int w, int h)
            => new NpgsqlBox(-y, x + (w - 1), -y - (h - 1), x);


        public async Task<ResourceType> GetResourceTypeFromId(string id)
        {
            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand("SELECT type FROM isaac_resources WHERE id = @Id;", connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, id);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                reader.Read();
                return (ResourceType)reader.GetInt32(0);
            }
            else
            {
                return ResourceType.Unspecified;
            }
        }

        public async Task<int> ChangeDisplayOrder(ChangeDisplayOrder displayOrder)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET display_order = @NewOrder WHERE id = @Id;",
                _npgsql.Parameter("@NewOrder", NpgsqlDbType.Integer, displayOrder.DisplayOrder ?? (object)DBNull.Value),
                _npgsql.Parameter("@Id", NpgsqlDbType.Text, displayOrder.ResourceId));

        public async Task<List<(int amount, IsaacResource item)>> GetTransformationItemRanking(string transformationId)
        {
            var result = new List<(int amount, IsaacResource item)>();

            var commandText =
                "SELECT COUNT(e.resource_one) AS item_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN isaac_resources r ON r.id = e.resource_one " +
                "WHERE e.resource_two = @TransformationId " +
                $"AND e.event_type = {(int)GameplayEventType.TransformationProgress} " +
                "GROUP BY r.id " +
                "ORDER BY item_count DESC, r.name ASC;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@TransformationId", NpgsqlDbType.Text, transformationId);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    var amount = reader.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = reader.GetString(1),
                        Name = reader.GetString(2),
                        ResourceType = (ResourceType)reader.GetInt32(3),
                        ExistsIn = (ExistsIn)reader.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)reader.GetValue(5),
                        GameMode = (GameMode)reader.GetInt32(6),
                        Color = reader.GetString(7),
                        Mod = null,
                        DisplayOrder = reader.IsDBNull(8) ? null : (int?)reader.GetInt32(8),
                        Difficulty = reader.IsDBNull(9) ? null : (int?)reader.GetInt32(9),
                        Tags = reader.IsDBNull(10) ? null : ((int[])reader[10]).Select(x => (Tag)x).ToList()
                    };
                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<List<(int amount, IsaacResource floor)>> GetFloorRanking(string resourceId, int resourceNumber, GameplayEventType? eventType = null)
        {
            var result = new List<(int amount, IsaacResource floor)>();

            string resourceName = resourceNumber == 1 ? "resource_one" : "resource_two";

            var commandText =
                "SELECT COUNT(f.id) AS floor_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN played_floors f ON f.id = e.played_floor " +
                "LEFT JOIN isaac_resources r ON r.id = f.floor " +
                $"WHERE e.{resourceName} = @ResourceId " +
                (eventType.HasValue ? $"AND e.event_type = @EventType " : string.Empty) +
                $"GROUP BY r.id " +
                $"ORDER BY floor_count DESC, r.name ASC;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@ResourceId", NpgsqlDbType.Text, resourceId);
            
            if (eventType.HasValue)
            {
                command.Parameters.AddWithValue("@EventType", NpgsqlDbType.Integer, (int)eventType.Value);
            }
            
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    var amount = reader.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = reader.GetString(1),
                        Name = reader.GetString(2),
                        ResourceType = (ResourceType)reader.GetInt32(3),
                        ExistsIn = (ExistsIn)reader.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)reader.GetValue(5),
                        GameMode = (GameMode)reader.GetInt32(6),
                        Color = reader.GetString(7),
                        Mod = null,
                        DisplayOrder = reader.IsDBNull(8) ? null : (int?)reader.GetInt32(8),
                        Difficulty = reader.IsDBNull(9) ? null : (int?)reader.GetInt32(9),
                        Tags = reader.IsDBNull(10) ? null : ((int[])reader[10]).Select(x => (Tag)x).ToList()
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

            var commandText =
                "SELECT COUNT(c.resource_one) AS curse_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN gameplay_events c ON c.played_floor = e.played_floor " +
                "LEFT JOIN isaac_resources r ON r.id = c.resource_one " +
                $"WHERE e.{resourceName} = @ResourceId " +
                $"AND c.event_type = {((int)GameplayEventType.Curse).ToString()} " +
                "GROUP BY r.id " +
                "ORDER BY curse_count DESC, r.name ASC;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@ResourceId", NpgsqlDbType.Text, resourceId);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while(reader.Read())
                {
                    var amount = reader.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = reader.GetString(1),
                        Name = reader.GetString(2),
                        ResourceType = (ResourceType)reader.GetInt32(3),
                        ExistsIn = (ExistsIn)reader.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)reader.GetValue(5),
                        GameMode = (GameMode)reader.GetInt32(6),
                        Color = reader.GetString(7),
                        Mod = null,
                        DisplayOrder = reader.IsDBNull(8) ? null : (int?)reader.GetInt32(8),
                        Difficulty = reader.IsDBNull(9) ? null : (int?)reader.GetInt32(9),
                        Tags = reader.IsDBNull(10) ? null : ((int[])reader[10]).Select(x => (Tag)x).ToList()
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

            var commandText =
                "SELECT COUNT(pc.game_character) AS gc_count, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN played_characters pc ON pc.id = e.played_character " +
                "LEFT JOIN isaac_resources r ON pc.game_character = r.id " +
                $"WHERE e.{resourceName} = @ResourceId " +
                "GROUP BY r.id " +
                "ORDER BY gc_count DESC, r.name ASC;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@ResourceId", NpgsqlDbType.Text, resourceId);
            using var reader = await command.ExecuteReaderAsync();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    var amount = reader.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = reader.GetString(1),
                        Name = reader.GetString(2),
                        ResourceType = (ResourceType)reader.GetInt32(3),
                        ExistsIn = (ExistsIn)reader.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)reader.GetValue(5),
                        GameMode = (GameMode)reader.GetInt32(6),
                        Color = reader.GetString(7),
                        Mod = null,
                        DisplayOrder = reader.IsDBNull(8) ? null : (int?)reader.GetInt32(8),
                        Difficulty = reader.IsDBNull(9) ? null : (int?)reader.GetInt32(9),
                        Tags = reader.IsDBNull(10) ? null : ((int[])reader[10]).Select(x => (Tag)x).ToList()
                    };

                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<List<(int amount, IsaacResource foundAt)>> GetFoundAtRanking(string itemId)
        {
            var result = new List<(int amount, IsaacResource foundAt)>();

            var commandText = 
                "SELECT COUNT(e.resource_two) as r2c, r.id, r.name, r.type, r.exists_in, r.x, r.game_mode, r.color, r.display_order, r.difficulty, r.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN isaac_resources r ON r.id = e.resource_two " +
                "WHERE(e.event_type = 2 OR e.event_type = 18) " +
                "AND e.resource_one = @Id " +
                "GROUP BY r.id " +
                "ORDER BY r2c DESC, r.id ASC;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, itemId);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while(reader.Read())
                {
                    var amount = reader.GetInt32(0);
                    var resource = new IsaacResource()
                    {
                        Id = reader.GetString(1),
                        Name = reader.GetString(2),
                        ResourceType = (ResourceType)reader.GetInt32(3),
                        ExistsIn = (ExistsIn)reader.GetInt32(4),
                        CssCoordinates = (NpgsqlBox)reader.GetValue(5),
                        GameMode = (GameMode)reader.GetInt32(6),
                        Color = reader.GetString(7),
                        Mod = null,
                        DisplayOrder = reader.IsDBNull(8) ? null : (int?)reader.GetInt32(8),
                        Difficulty = reader.IsDBNull(9) ? null : (int?)reader.GetInt32(9),
                        Tags = reader.IsDBNull(10) ? null : ((int[])reader[10]).Select(x => (Tag)x).ToList()
                    };

                    result.Add((amount, resource));
                }
            }

            return result;
        }

        public async Task<string?> GetResourceNameFromId(string id)
            => await _npgsql.ScalarString("SELECT name FROM isaac_resources WHERE id = @Id;",
                _npgsql.Parameter("@Id", NpgsqlDbType.Text, id));

        public async Task<List<DateTime>> GetEncounteredIsaacResourceTimestamps(string isaacResourceId, int resourceNumber, GameplayEventType? eventType = null)
        {
            var result = new List<DateTime>();

            string resourceNumberString = resourceNumber is 1 ? "resource_one" : "resource_two";
            string eventTypeFragment = eventType.HasValue ? "AND event_type = @EventType" : string.Empty;

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand($"SELECT v.published FROM gameplay_events g LEFT JOIN videos v ON v.id = g.video WHERE g.{resourceNumberString} = @Id {eventTypeFragment} ORDER BY v.published ASC;", connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, isaacResourceId);
            if (eventType.HasValue)
            {
                command.Parameters.AddWithValue("@EventType", NpgsqlDbType.Integer, (int)eventType.Value);
            }

            using var reader = await command.ExecuteReaderAsync();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    result.Add(reader.GetDateTime(0));
                }
            }

            return result;
        }

        private int ResourceOneOrTwo(GameplayEventType eventType)
        {
            if (eventType == GameplayEventType.RerollTransform 
                || eventType == GameplayEventType.Clicker 
                || eventType == GameplayEventType.AbsorbedItem 
                || eventType == GameplayEventType.Clicker 
                || eventType == GameplayEventType.RerollTransform
                || eventType == GameplayEventType.AbsorbedItem)
            {
                return 2;
            }
            return 1;
        }

        public async Task<History> GetHistory(SubmittedCompleteEpisode episode)
        {
            if (episode.PlayedCharacters is null || episode.PlayedCharacters.Count is 0)
            {
                return new History();
            }

            var characters = episode.PlayedCharacters.Select(x => x.CharacterId).ToList();
            var floors = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors).Select(x => x.FloorId).ToList();
            var events = episode.PlayedCharacters.SelectMany(x => x.PlayedFloors).SelectMany(x => x.GameplayEvents).Select(x => ResourceOneOrTwo(x.EventType) == 1 ? x.RelatedResource1 : x.RelatedResource2).ToList();

            var allResources = new List<string?>();
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


            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(sb.ToString(), connection);
            command.Parameters.AddRange(p.ToArray());
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    var box = (NpgsqlBox)reader[1];
                    allImages.Add(reader.GetString(0), new IsaacResourceImage((int)box.Left, (int)box.Top, (int)box.Height, (int)box.Width, (ResourceType)reader.GetInt32(2)));
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
                        history.CharacterHistory[c].Floors[f].Events[e].Image = allImages[
                            ResourceOneOrTwo(episode.PlayedCharacters[c].PlayedFloors[f].GameplayEvents[e].EventType) == 1 
                            ? episode.PlayedCharacters[c].PlayedFloors[f].GameplayEvents[e].RelatedResource1 
                            : episode.PlayedCharacters[c].PlayedFloors[f].GameplayEvents[e].RelatedResource2!
                        ];
                    }
                }
            }

            return history;
        }

        public async Task<bool> CoordinatesAreTaken(int x, int y, int h, int w)
        {
            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand("SELECT 1 FROM isaac_resources WHERE x && @X IS TRUE;", connection);
            command.Parameters.AddWithValue("@X", NpgsqlDbType.Box, CreateBoxCoordinatesFromScreenCoordinates(x, y, w, h));
            using var reader = await command.ExecuteReaderAsync();
            return reader.HasRows;
        }

        public async Task<List<SubmittedEpisode>> GetSubmittedEpisodesForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null)
        {
            var result = new List<SubmittedEpisode>();
            var publicPrefix = tableData is null ? "public." : string.Empty;

            tableData ??= TempTables.UseRealTableNames();
            var videoSubmissions = tableData.TempVideoSubmissionsTable;
            var videoSubmissionsUserdata = tableData.TempVideoSubmissionsUserdataTable;

            

            string commandText = 
                $"SELECT s.id, s.s_type, s.latest, u.\"UserName\" " +
                $"FROM {publicPrefix}{videoSubmissions} s " +
                $"LEFT JOIN {publicPrefix}{videoSubmissionsUserdata} d ON d.submission = s.id " +
                $"LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                $"WHERE s.video = @VideoId" +
                $"{(submissionId is null ? " AND s.latest = TRUE" : " AND s.id = @SubmissionId")}; ";

            var connection = session ?? await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) command.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    var e = new SubmittedEpisode
                    {
                        Id = reader.GetInt32(i++),
                        SubmissionType = (SubmissionType)reader.GetInt32(i++),
                        Latest = reader.GetBoolean(i++),
                        PlayedCharacters = new List<PlayedCharacter>(),
                        Video = videoId,
                        UserName = reader.IsDBNull(i++) ? "[unknown]" : reader.GetString(i - 1)
                    };
                    result.Add(e);
                }
            }

            if (session is null)
            {
                connection.Dispose();
            }

            return result;
        }

        public async Task<PlayedCharacter?> GetPlayedCharacterById(int playedCharacterId)
        {
            PlayedCharacter? result = default;

            string commandText =
                "SELECT " +
                    "pc.id, pc.action, pc.run_number, pc.submission, pc.seed, " +
                    "c.id, c.name, c.type, c.exists_in, c.x, c.game_mode, c.color, c.display_order, c.difficulty, c.tags, " +
                    "d.id, d.name, d.type, d.exists_in, d.x, d.game_mode, d.color, d.display_order, d.difficulty, d.tags " +
                "FROM played_characters pc " +
                "LEFT JOIN isaac_resources c ON c.id = pc.game_character " +
                "LEFT JOIN isaac_resources d ON d.id = pc.died_from " +
                $"WHERE id = @Id;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, playedCharacterId);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                reader.Read();
                int i = 0;
                result = new PlayedCharacter
                {
                    Id = reader.GetInt32(i++),
                    Action = reader.GetInt32(i++),
                    RunNumber = reader.GetInt32(i++),
                    Submission = reader.GetInt32(i++),
                    Seed = reader.IsDBNull(i++) ? null : reader.GetString(i - 1),
                    GameCharacter = new IsaacResource()
                    {
                        Id = reader.GetString(i++),
                        Name = reader.GetString(i++),
                        ResourceType = (ResourceType)reader.GetInt32(i++),
                        ExistsIn = (ExistsIn)reader.GetInt32(i++),
                        CssCoordinates = (NpgsqlBox)reader[i++],
                        GameMode = (GameMode)reader.GetInt32(i++),
                        Color = reader.GetString(i++),
                        DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList(),
                    }
                };

                if (!reader.IsDBNull(i))
                {
                    result.DiedFrom = new IsaacResource()
                    {
                        Id = reader.GetString(i++),
                        Name = reader.GetString(i++),
                        ResourceType = (ResourceType)reader.GetInt32(i++),
                        ExistsIn = (ExistsIn)reader.GetInt32(i++),
                        CssCoordinates = (NpgsqlBox)reader[i++],
                        GameMode = (GameMode)reader.GetInt32(i++),
                        Color = reader.GetString(i++),
                        DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                    };
                }
            }

            return result;
        }

        public async Task<List<PlayedCharacter>>GetPlayedCharactersForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null)
        {
            var result = new List<PlayedCharacter>();
            tableData ??= TempTables.UseRealTableNames();
            var playedCharacters = tableData.TempPlayedCharactersTable;

            string commandText = 
                "SELECT " +
                    "pc.id, pc.action, pc.run_number, pc.submission, pc.seed, pc.game_mode, " +
                    "c.id, c.name, c.type, c.exists_in, c.x, c.game_mode, c.color, c.display_order, c.difficulty, c.tags, " +
                    "d.id, d.name, d.type, d.exists_in, d.x, d.game_mode, d.color, d.display_order, d.difficulty, d.tags " +
                $"FROM {playedCharacters} pc " +
                "LEFT JOIN isaac_resources c ON c.id = pc.game_character " +
                "LEFT JOIN isaac_resources d ON d.id = pc.died_from " +
                $"WHERE pc.video = @VideoId{(submissionId is null ? " AND pc.latest = TRUE" : " AND pc.submission = @SubmissionId")} " +
                "GROUP BY pc.submission, pc.id, c.id, d.id " +
                "ORDER BY pc.run_number ASC, pc.action ASC; ";

            var connection = session ?? await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) command.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    var playedCharacter = new PlayedCharacter
                    {
                        Id = reader.GetInt32(i++),
                        Action = reader.GetInt32(i++),
                        RunNumber = reader.GetInt32(i++),
                        Submission = reader.GetInt32(i++),
                        Seed = reader.IsDBNull(i++) ? null : reader.GetString(i - 1),
                        GameMode = (GameMode)reader.GetInt32(i++),
                        GameCharacter = new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList(),
                        }
                    };

                    if (!reader.IsDBNull(i))
                    {
                        playedCharacter.DiedFrom = new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                        };
                    }

                    result.Add(playedCharacter);
                }
            }

            if (session is null)
            {
                connection.Dispose();
            }

            return result;
        }

        public async Task<PlayedFloor?> GetPlayedFloorById(int id)
        {
            PlayedFloor? result = default;

            string commandText =
                "SELECT " +
                    "pf.id, pf.action, pf.run_number, pf.floor_number, pf.submission, pf.duration, " +
                    "f.id, f.name, f.type, f.exists_in, f.x, f.game_mode, f.color, f.display_order, f.difficulty, f.tags, " +
                    "d.id, d.name, d.type, d.exists_in, d.x, d.game_mode, d.color, d.display_order, d.difficulty, d.tags " +
                "FROM played_floors pf " +
                "LEFT JOIN isaac_resources f ON f.id = pf.floor " +
                "LEFT JOIN isaac_resources d ON d.id = pf.died_from " +
                "WHERE id = @Id;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, id);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                reader.Read();
                int i = 0;
                result = new PlayedFloor()
                {
                    Id = reader.GetInt32(i++),
                    Action = reader.GetInt32(i++),
                    RunNumber = reader.GetInt32(i++),
                    FloorNumber = reader.GetInt32(i++),
                    Submission = reader.GetInt32(i++),
                    Duration = reader.GetInt32(i++),
                    Floor = new IsaacResource()
                    {
                        Id = reader.GetString(i++),
                        Name = reader.GetString(i++),
                        ResourceType = (ResourceType)reader.GetInt32(i++),
                        ExistsIn = (ExistsIn)reader.GetInt32(i++),
                        CssCoordinates = (NpgsqlBox)reader[i++],
                        GameMode = (GameMode)reader.GetInt32(i++),
                        Color = reader.GetString(i++),
                        DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                    }
                };

                if (!reader.IsDBNull(i))
                {
                    result.DiedFrom = new IsaacResource()
                    {
                        Id = reader.GetString(i++),
                        Name = reader.GetString(i++),
                        ResourceType = (ResourceType)reader.GetInt32(i++),
                        ExistsIn = (ExistsIn)reader.GetInt32(i++),
                        CssCoordinates = (NpgsqlBox)reader[i++],
                        GameMode = (GameMode)reader.GetInt32(i++),
                        Color = reader.GetString(i++),
                        DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                    };
                }
            }

            return result;
        }

        public async Task<List<PlayedFloor>> GetFloorsForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null)
        {
            var result = new List<PlayedFloor>();
            tableData ??= TempTables.UseRealTableNames();
            var playedFloors = tableData.TempPlayedFloorsTable;

            string commandText =
                "SELECT " +
                    "pf.id, pf.action, pf.run_number, pf.floor_number, pf.submission, pf.duration, " +
                    "f.id, f.name, f.type, f.exists_in, f.x, f.game_mode, f.color, f.display_order, f.difficulty, f.tags, " +
                    "d.id, d.name, d.type, d.exists_in, d.x, d.game_mode, d.color, d.display_order, d.difficulty, d.tags " +
                $"FROM {playedFloors} pf " +
                "LEFT JOIN isaac_resources f ON f.id = pf.floor " +
                "LEFT JOIN isaac_resources d ON d.id = pf.died_from " +
                $"WHERE pf.video = @VideoId{(submissionId is null ? " AND pf.latest = TRUE " : " AND pf.submission = @SubmissionId")} " +
                "GROUP BY pf.id, f.id, d.id " +
                "ORDER BY pf.run_number ASC, pf.action ASC; ";

            var connection = session ?? await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) command.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    var floor = new PlayedFloor()
                    {
                        Id = reader.GetInt32(i++),
                        Action = reader.GetInt32(i++),
                        RunNumber = reader.GetInt32(i++),
                        FloorNumber = reader.GetInt32(i++),
                        Submission = reader.GetInt32(i++),
                        Duration = reader.GetInt32(i++),
                        Floor = new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                        }
                    };

                    if (!reader.IsDBNull(i))
                    {
                        floor.DiedFrom = new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                        };
                    }

                    result.Add(floor);
                }
            }

            if (session is null)
            {
                connection.Dispose();
            }

            return result;
        }


        public async Task<GameplayEvent?> GetGameplayEventById(int id)
        {
            GameplayEvent? result = default;

            var commandText =
                "SELECT " +
                    "e.id, e.event_type, e.action, e.resource_three, e.run_number, e.player, e.floor_number, e.submission, e.was_rerolled, e.played_character, e.played_floor, e.latest, " +
                    "r1.id, r1.name, r1.type, r1.exists_in, r1.x, r1.game_mode, r1.color, r1.display_order, r1.difficulty, r1.tags, " +
                    "r2.id, r2.name, r2.type, r2.exists_in, r2.x, r2.game_mode, r2.color, r2.display_order, r2.difficulty, r2.tags " +
                "FROM gameplay_events e " +
                "LEFT JOIN isaac_resources r1 ON r1.id = e.resource_one " +
                "LEFT JOIN isaac_resources r2 ON r2.id = e.resource_two " +
                $"WHERE e.id = @Id;";

            var connection = await _npgsql.Connect();
            var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, id);
            var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                reader.Read();
                int i = 0;
                result = new GameplayEvent()
                {
                    Id = reader.GetInt32(i++),
                    EventType = (GameplayEventType)reader.GetInt32(i++),
                    Action = reader.GetInt32(i++),
                    Resource3 = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                    RunNumber = reader.GetInt32(i++),
                    Player = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                    FloorNumber = reader.GetInt32(i++),
                    Submission = reader.GetInt32(i++),
                    WasRerolled = reader.GetBoolean(i++),
                    PlayedCharacterId = reader.GetInt32(i++),
                    PlayedFloorId = reader.GetInt32(i++),
                    Latest = reader.GetBoolean(i++),
                    Resource1 = new IsaacResource()
                    {
                        Id = reader.GetString(i++),
                        Name = reader.GetString(i++),
                        ResourceType = (ResourceType)reader.GetInt32(i++),
                        ExistsIn = (ExistsIn)reader.GetInt32(i++),
                        CssCoordinates = (NpgsqlBox)reader[i++],
                        GameMode = (GameMode)reader.GetInt32(i++),
                        Color = reader.GetString(i++),
                        DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList(),
                    }
                };

                if (!reader.IsDBNull(i))
                {
                    result.Resource2 = new IsaacResource()
                    {
                        Id = reader.GetString(i++),
                        Name = reader.GetString(i++),
                        ResourceType = (ResourceType)reader.GetInt32(i++),
                        ExistsIn = (ExistsIn)reader.GetInt32(i++),
                        CssCoordinates = (NpgsqlBox)reader[i++],
                        GameMode = (GameMode)reader.GetInt32(i++),
                        Color = reader.GetString(i++),
                        DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                    };
                }
            }

            return result;
        }


        public async Task<List<GameplayEvent>> GetGameplayEventsForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null)
        {
            var result = new List<GameplayEvent>();
            tableData ??= TempTables.UseRealTableNames();
            var gameplayEvents = tableData.TempGameplayEventsTable;

            var commandText =
                "SELECT " +
                    "e.id, e.event_type, e.action, e.resource_three, e.run_number, e.player, e.floor_number, e.submission, e.was_rerolled, e.played_character, e.played_floor, " +
                    "r1.id, r1.name, r1.type, r1.exists_in, r1.x, r1.game_mode, r1.color, r1.display_order, r1.difficulty, r1.tags, " +
                    "r2.id, r2.name, r2.type, r2.exists_in, r2.x, r2.game_mode, r2.color, r2.display_order, r2.difficulty, r2.tags " +
                $"FROM {gameplayEvents} e " +
                "LEFT JOIN isaac_resources r1 ON r1.id = e.resource_one " +
                "LEFT JOIN isaac_resources r2 ON r2.id = e.resource_two " +
                $"WHERE e.video = @VideoId{(submissionId is null ? " AND e.latest = TRUE " : " AND e.submission = @SubmissionId")} " +
                "GROUP BY e.submission, e.id, r1.id, r2.id " +
                "ORDER BY e.run_number ASC, e.action ASC;";

            var connection = session ?? await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@VideoId", NpgsqlDbType.Text, videoId);
            if (submissionId != null) command.Parameters.AddWithValue("@SubmissionId", NpgsqlDbType.Integer, submissionId.Value);

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    var gameplayEvent = new GameplayEvent()
                    {
                        Id = reader.GetInt32(i++),
                        EventType = (GameplayEventType)reader.GetInt32(i++),
                        Action = reader.GetInt32(i++),
                        Resource3 = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        RunNumber = reader.GetInt32(i++),
                        Player = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                        FloorNumber = reader.GetInt32(i++),
                        Submission = reader.GetInt32(i++),
                        WasRerolled = reader.GetBoolean(i++),
                        PlayedCharacterId = reader.GetInt32(i++),
                        PlayedFloorId = reader.GetInt32(i++),
                        Resource1 = new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList(),
                        }
                    };

                    if (!reader.IsDBNull(i))
                    {
                        gameplayEvent.Resource2 = new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                        };
                    }

                    result.Add(gameplayEvent);
                }
            }

            if (session is null)
            {
                connection.Dispose();
            }

            return result;
        }


        public async Task<int> UpdateExistsIn(string id, ExistsIn newExistsIn)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET exists_in = @E WHERE id = @I;",
                _npgsql.Parameter("@E", NpgsqlDbType.Integer, (int)newExistsIn),
                _npgsql.Parameter("@I", NpgsqlDbType.Text, id));


        public async Task<int> UpdateGameMode(string id, GameMode newGameMode)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET game_mode = @G WHERE id = @I;",
                _npgsql.Parameter("@G", NpgsqlDbType.Integer, (int)newGameMode),
                _npgsql.Parameter("@I", NpgsqlDbType.Text, id));


        public async Task<int> UpdateName(string id, string newName)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET name = @N WHERE id = @I;",
                _npgsql.Parameter("@N", NpgsqlDbType.Text, newName),
                _npgsql.Parameter("@I", NpgsqlDbType.Text, id));


        public async Task<int> UpdateId(string oldId, string newId)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET id = @NewId WHERE id = @OldId;",
                _npgsql.Parameter("@NewId", NpgsqlDbType.Text, newId),
                _npgsql.Parameter("@OldId", NpgsqlDbType.Text, oldId));


        public async Task<int> CountResources(ResourceType type = ResourceType.Unspecified)
        {
            var commandText = type == ResourceType.Unspecified
                ? "SELECT COUNT(*) FROM isaac_resources;"
                : "SELECT COUNT(*) FROM isaac_resources WHERE type = @Type;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);

            if (type != ResourceType.Unspecified)
            {
                command.Parameters.AddWithValue("@Type", NpgsqlDbType.Integer, (int)type);
            }

            var result = Convert.ToInt32(await command.ExecuteScalarAsync());
            return result;
        }


        public async Task<string?> GetFirstResourceIdFromName(string name)
            => await _npgsql.ScalarString("SELECT id FROM isaac_resources WHERE name = @Name",
                _npgsql.Parameter("@Name", NpgsqlDbType.Text, name));


        public async Task<string?> SaveResource(CreateIsaacResource resource, int x, int y, int w, int h)
            => await _npgsql.ScalarString(
                "INSERT INTO isaac_resources (id, name, type, exists_in, x, game_mode, color, mod, display_order, difficulty, tags) VALUES (@I, @N, @D, @E, @X, @M, @C, @L, @O, @U, @T) RETURNING id;",
                _npgsql.Parameter("@I", NpgsqlDbType.Text, resource.Id),
                _npgsql.Parameter("@N", NpgsqlDbType.Text, resource.Name),
                _npgsql.Parameter("@D", NpgsqlDbType.Integer, (int)resource.ResourceType),
                _npgsql.Parameter("@E", NpgsqlDbType.Integer, (int)resource.ExistsIn),
                _npgsql.Parameter("@X", NpgsqlDbType.Box, CreateBoxCoordinatesFromScreenCoordinates(x, y, w, h)),
                _npgsql.Parameter("@M", NpgsqlDbType.Integer, (int)resource.GameMode),
                _npgsql.Parameter("@C", NpgsqlDbType.Text, resource.Color),
                _npgsql.Parameter("@L", NpgsqlDbType.Integer, resource.FromMod ?? (object)DBNull.Value),
                _npgsql.Parameter("@O", NpgsqlDbType.Integer, resource.DisplayOrder ?? (object)DBNull.Value),
                _npgsql.Parameter("@U", NpgsqlDbType.Integer, resource.Difficulty ?? (object)DBNull.Value),
                _npgsql.Parameter("@T", NpgsqlDbType.Array | NpgsqlDbType.Integer, resource.Tags?.Select(x => (int)x).ToArray() ?? (object)DBNull.Value));


        public async Task<int> UpdateIconCoordinates(string resourceId, int x, int y, int w, int h)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET x = @X WHERE id = @I;",
                _npgsql.Parameter("@X", NpgsqlDbType.Box, CreateBoxCoordinatesFromScreenCoordinates(x, y, w, h)),
                _npgsql.Parameter("@I", NpgsqlDbType.Text, resourceId));


        private string GetOrderByClause(ResourceOrderBy orderBy, string prefix, bool asc)
            => orderBy switch
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


        public async Task<List<TransformativeIsaacResource>> GetTransformationItems(string transformationId)
        {
            var resources = new List<TransformativeIsaacResource>();

            var commandText =
                "SELECT " +
                    "i.id, i.name, i.type, i.exists_in, i.x, i.game_mode, i.color, i.display_order, i.difficulty, i.tags, " +
                    "t.counts_multiple_times, t.requires_title_content, t.valid_from, t.valid_until, t.steps_needed " +
                "FROM transformative_resources t " +
                "LEFT JOIN isaac_resources i " +
                "ON t.isaac_resource = i.id " +
                "WHERE t.transformation = @TransformationId " +
                "ORDER BY name ASC;";

            using var connection = await _npgsql.Connect();
            using var command = _npgsql.Command(connection, commandText, _npgsql.Parameter("@TransformationId", NpgsqlDbType.Text, transformationId));
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while(reader.Read())
                {
                    int i = 0;

                    if (!resources.Any(r => r.Id == reader.GetString(0)))
                    {
                        resources.Add(new TransformativeIsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList(),
                            CountsMultipleTimes = reader.GetBoolean(i++),
                            RequiresTitleContent = reader.IsDBNull(i++) ? null : reader.GetString(i - 1),
                            ValidFrom = reader.IsDBNull(i++) ? null : reader.GetDateTime(i - 1),
                            ValidUntil = reader.IsDBNull(i++) ? null : reader.GetDateTime(i - 1),
                            StepsNeeded = reader.GetInt32(i++)
                        });
                    }
                }
            }

            return resources;
        }


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
            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(s.ToString(), connection);
            command.Parameters.AddRange(parameters.ToArray());

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    var resourceId = reader.GetString(i);
                    if (!resources.Any(x => x.Id == resourceId))
                    {
                        resources.Add(new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                        });
                    }
                    else i += 10;

                    var currentResource = resources.First(x => x.Id == resourceId);

                    if (request.IncludeMod)
                    {
                        if (!reader.IsDBNull(i) && currentResource.Mod is null)
                        {
                            resources.First(x => x.Id == resourceId).Mod = new Mod()
                            {
                                Id = reader.GetInt32(i++),
                                ModName = reader.GetString(i++),
                            };
                        }
                        else i += 2;

                        if (!reader.IsDBNull(i) && currentResource.Mod != null && !currentResource.Mod!.ModUrls.Any(x => x.Id == reader.GetInt32(i)))
                        {
                            currentResource.Mod!.ModUrls.Add(new ModUrl()
                            {
                                Id = reader.GetInt32(i++),
                                Url = reader.GetString(i++),
                                LinkText = reader.GetString(i++)
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

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(s.ToString(), connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, id);

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    if (result is null)
                    {
                        result = new IsaacResource()
                        {
                            Id = reader.GetString(i++),
                            Name = reader.GetString(i++),
                            ResourceType = (ResourceType)reader.GetInt32(i++),
                            ExistsIn = (ExistsIn)reader.GetInt32(i++),
                            CssCoordinates = (NpgsqlBox)reader[i++],
                            GameMode = (GameMode)reader.GetInt32(i++),
                            Color = reader.GetString(i++),
                            DisplayOrder = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Difficulty = reader.IsDBNull(i++) ? null : (int?)reader.GetInt32(i - 1),
                            Tags = reader.IsDBNull(i++) ? null : ((int[])reader[i - 1]).Select(x => (Tag)x).ToList()
                        };
                    }
                    else i += 10;

                    if (includeMod)
                    {
                        if (!reader.IsDBNull(i) && result.Mod is null)
                        {
                            result.Mod = new Mod()
                            {
                                Id = reader.GetInt32(i++),
                                ModName = reader.GetString(i++),
                            };
                        }
                        else i += 2;

                        if (!reader.IsDBNull(i) && result.Mod != null && !result.Mod.ModUrls.Any(x => x.Id == reader.GetInt32(i)))
                        {
                            result.Mod.ModUrls.Add(new ModUrl()
                            {
                                Id = reader.GetInt32(i++),
                                Url = reader.GetString(i++),
                                LinkText = reader.GetString(i++)
                            });
                        }
                        else i += 3;
                    }
                }
            }

            return result;
        }


        public async Task<int> DeleteResource(string resourceId)
            => await _npgsql.NonQuery("DELETE FROM isaac_resources WHERE id = @Id;",
                _npgsql.Parameter("@Id", NpgsqlDbType.Text, resourceId));


        public async Task<bool> ResourceExists(string resourceId)
        {
            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand("SELECT id FROM isaac_resources WHERE id = @Id;", connection);
            command.Parameters.AddWithValue("@Id", NpgsqlDbType.Text, resourceId);
            using var reader = await command.ExecuteReaderAsync();
            return reader.HasRows;
        }


        public async Task<(bool allowsMultiple, string? transformationId, string? requiredTitleString)> IsTransformativeForPointInTime(string isaacResourceId, DateTime pointInTime)
        {
            string commandText =
                "SELECT transformation, counts_multiple_times, requires_title_content " +
                "FROM transformative_resources " +
                "WHERE isaac_resource = @IsaacResource " +
                "AND valid_from <= @PointInTime " +
                "AND valid_until >= @PointInTime;";

            using var connection = await _npgsql.Connect();
            using var command = _npgsql.Command(connection, commandText, 
                _npgsql.Parameter("@IsaacResource", NpgsqlDbType.Text, isaacResourceId),
                _npgsql.Parameter("@PointInTime", NpgsqlDbType.TimestampTz, pointInTime));

            using var reader = await command.ExecuteReaderAsync();
            
            if (reader.HasRows)
            {
                reader.Read();
                return (reader.GetBoolean(1), reader.GetString(0), reader.IsDBNull(2) ? null : reader.GetString(2));
            }

            return (false, null, null);
        }


        public async Task<int> MakeTransformative(MakeIsaacResourceTransformative model)
        {
            string commandText =
                "INSERT INTO transformative_resources (id, isaac_resource, transformation, counts_multiple_times, requires_title_content, valid_from, valid_until, steps_needed) " +
                $"VALUES (DEFAULT, @IR, @TR, @CM, @RT, {(model.ValidFrom.HasValue ? "@VF" : "DEFAULT")}, {(model.ValidUntil.HasValue ? "@VU" : "DEFAULT")}, @SN) RETURNING id;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@IR", NpgsqlDbType.Text, model.ResourceId);
            command.Parameters.AddWithValue("@TR", NpgsqlDbType.Text, model.TransformationId);
            command.Parameters.AddWithValue("@CM", NpgsqlDbType.Boolean, model.CanCountMultipleTimes);
            command.Parameters.AddWithValue("@RT", NpgsqlDbType.Text, model.RequiresTitleContent ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@SN", NpgsqlDbType.Integer, model.StepsNeeded);
            if (model.ValidFrom.HasValue) command.Parameters.AddWithValue("@VF", NpgsqlDbType.TimestampTz, model.ValidFrom ?? (object)DBNull.Value);
            if (model.ValidUntil.HasValue) command.Parameters.AddWithValue("@VU", NpgsqlDbType.TimestampTz, model.ValidUntil ?? (object)DBNull.Value);

            return Convert.ToInt32(await command.ExecuteScalarAsync());
        }

        public async Task<int> MakeUntransformative(string transformationId, string isaacResourceId)
        {
            string commandText =
                "DELETE FROM transformative_resources " +
                "WHERE isaac_resource = @IsaacResource " +
                "AND transformation = @Transformation;";

            return await _npgsql.NonQuery(
                commandText,
                _npgsql.Parameter("@IsaacResource", NpgsqlDbType.Text, isaacResourceId),
                _npgsql.Parameter("@Transformation", NpgsqlDbType.Text, transformationId));
        }


        public async Task<int> DeleteSubmission(int submissionId)
            => await _npgsql.NonQuery("DELETE FROM video_submissions WHERE id = @Id;",
                _npgsql.Parameter("@Id", NpgsqlDbType.Integer, submissionId));


        public async Task<bool> HasTags(string resourceId, params Tag[] effects)
        {
            bool hasEffects = false;

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand($"SELECT 1 FROM isaac_resources WHERE id = @Resource AND tags @> @RequiredEffects; ", connection);
            command.Parameters.AddWithValue("@Resource", NpgsqlDbType.Text, resourceId);
            command.Parameters.AddWithValue("@RequiredEffects", NpgsqlDbType.Array | NpgsqlDbType.Integer, effects.Select(x => (int)x).ToArray());

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                hasEffects = true;
            }

            return hasEffects;
        }


        public async Task<List<(string transformation, bool countsMultipleTimes, int stepsNeeded)>> GetTransformationData(string resourceId, string videoTitle, DateTime videoReleasedate)
        {
            var result = new List<(string, bool, int)>();

            var commandText =
                "SELECT t.isaac_resource, t.transformation, t.counts_multiple_times, t.requires_title_content, t.valid_from, t.valid_until, t.steps_needed " +
                "FROM transformative_resources t " +
                "WHERE isaac_resource = @I " +
                "AND valid_from <= @R " +
                "AND valid_until >= @R;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);

            command.Parameters.AddWithValue("@I", NpgsqlDbType.Text, resourceId);
            command.Parameters.AddWithValue("@R", NpgsqlDbType.TimestampTz, videoReleasedate);

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    string? requiredTitleContent = reader.IsDBNull(3) ? null : reader.GetString(3);

                    if (requiredTitleContent != null && !videoTitle.ToLower().Contains(requiredTitleContent.ToLower()))
                    {
                        continue;
                    }

                    result.Add((reader.GetString(1), reader.GetBoolean(2), reader.GetInt32(6)));
                }
            }

            return result;
        }


        public async Task<int> AddTag(string id, Tag tag)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET tags = tags || ARRAY[@T] WHERE id = @Id;",
                _npgsql.Parameter("@T", NpgsqlDbType.Integer, (int)tag),
                _npgsql.Parameter("@Id", NpgsqlDbType.Text, id));


        public async Task<int> ClearTags(string id)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET tags = NULL WHERE id = @Id;",
                _npgsql.Parameter("@Id", NpgsqlDbType.Text, id));


        public List<AvailableStats> GetAvailableStats(IsaacResource resource)
            => resource.ResourceType switch
            {
                ResourceType.Boss => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Character => new List<AvailableStats>() { AvailableStats.Curse, AvailableStats.History },
                ResourceType.CharacterReroll => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Curse => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Enemy => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Floor => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History },
                ResourceType.Item => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.FoundAt, AvailableStats.History, AvailableStats.Floor },
                ResourceType.ItemSource => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History },
                ResourceType.OtherConsumable => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.OtherEvent => new List<AvailableStats>() { AvailableStats.History },
                ResourceType.Pill => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Rune => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.TarotCard => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                ResourceType.Transformation => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor, AvailableStats.TransformationItemRanking },
                ResourceType.Trinket => new List<AvailableStats>() { AvailableStats.Character, AvailableStats.Curse, AvailableStats.History, AvailableStats.Floor },
                _ => new List<AvailableStats>(),
            };


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
            => await _npgsql.NonQuery("UPDATE isaac_resources SET color = @Color WHERE id = @Id;",
                _npgsql.Parameter("@Color", NpgsqlDbType.Text, changeColor.Color),
                _npgsql.Parameter("@Id", NpgsqlDbType.Text, changeColor.ResourceId));


        public async Task<int> UpdateMod(ChangeMod changeMod)
            => await _npgsql.NonQuery("UPDATE isaac_resources SET mod = @ModId WHERE id = @ResourceId;",
                _npgsql.Parameter("@ModId", NpgsqlDbType.Integer, changeMod.ModId ?? (object)DBNull.Value),
                _npgsql.Parameter("@ResourceId", NpgsqlDbType.Text, changeMod.ResourceId));
    }
}


