using Npgsql;
using NpgsqlTypes;
using System;
using System.Threading.Tasks;
using Website.Models.Admin;
using Website.Services;

namespace Website.Data
{
    public class EditSubmissionRepository : IEditSubmissionRepository
    {
        private readonly INpgsql _npgsql;
        private readonly IIsaacRepository _isaac;

        public EditSubmissionRepository(INpgsql connector, IIsaacRepository isaac)
        {
            _npgsql = connector;
            _isaac = isaac;
        }

        public async Task<int> DeleteSubmission(int? submissionId)
        {
            if (submissionId is null)
            {
                return 0;
            }

            var videoId = await _npgsql.ScalarString("SELECT video FROM video_submissions WHERE id = @Id;",
                _npgsql.Parameter("@Id", NpgsqlDbType.Integer, submissionId));

            if (videoId is null)
            {
                return 0;
            }

            var dbChanges = await _npgsql.NonQuery(
                "DELETE FROM video_submissions WHERE id = @Id;",
                _npgsql.Parameter("@Id", NpgsqlDbType.Integer, submissionId));

            var remainingSubmission = await _npgsql.ScalarInt("SELECT MAX(id) FROM video_submissions WHERE video = @VideoId;",
               _npgsql.Parameter("@VideoId", NpgsqlDbType.Text, videoId));

            if (!remainingSubmission.HasValue || remainingSubmission.Value is 0)
            {
                return dbChanges;
            }

            dbChanges += await _npgsql.NonQuery("UPDATE video_submissions SET latest = TRUE WHERE id = @Id;", _npgsql.Parameter("@Id", NpgsqlDbType.Integer, remainingSubmission.Value));
            dbChanges += await _npgsql.NonQuery("UPDATE played_characters SET latest = TRUE WHERE submission = @Id;", _npgsql.Parameter("@Id", NpgsqlDbType.Integer, remainingSubmission.Value));
            dbChanges += await _npgsql.NonQuery("UPDATE played_floors SET latest = TRUE WHERE submission = @Id;", _npgsql.Parameter("@Id", NpgsqlDbType.Integer, remainingSubmission.Value));
            dbChanges += await _npgsql.NonQuery("UPDATE gameplay_events SET latest = TRUE WHERE submission = @Id;", _npgsql.Parameter("@Id", NpgsqlDbType.Integer, remainingSubmission.Value));

            return dbChanges;
        }

        public async Task<int> UpdateGameplayEventType(UpdateGameplayEventType updateGameplayEventType)
        {
            if (!updateGameplayEventType.GameplayEventId.HasValue)
            {
                return 0;
            }

            return await _npgsql.NonQuery("UPDATE gameplay_events SET event_type = @NewEventType WHERE id = @Id;",
                _npgsql.Parameter("@NewEventType", NpgsqlDbType.Integer, (int)updateGameplayEventType.NewGameplayEventType),
                _npgsql.Parameter("@Id", NpgsqlDbType.Integer, updateGameplayEventType.GameplayEventId.Value));
        }


        public async Task<int> IncrementActionNumberAfterEventWithId(IncrementActionNumberAfterEventWithId incrementActionNumberAfterEventWithId)
            => await IncrementActionNumberAfterEventWithId(
                incrementActionNumberAfterEventWithId.SubmissionId, 
                incrementActionNumberAfterEventWithId.EventId, 
                incrementActionNumberAfterEventWithId.IncrementByAmount);


        public async Task<int> IncrementActionNumberAfterEventWithId(int submissionId, int eventId, int incrementByAmount = 1)
        {
            // get action and run number of the event after which a new event is inserted
            using var connection = await _npgsql.Connect();
            using var commandText = new NpgsqlCommand("SELECT action, run_number FROM gameplay_events WHERE id = @Id", connection);
            commandText.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, eventId);
            using var reader = await commandText.ExecuteReaderAsync();

            if (!reader.HasRows)
            {
                return 0;
            }

            reader.Read();
            int currentAction = reader.GetInt32(0);
            int currentRunNumber = reader.GetInt32(1);


            // bump action coutner of events, floors and characters of the same run whose action is greater than the current event action
            int updateChanges = 0;
            updateChanges += await _npgsql.NonQuery(
                "UPDATE gameplay_events SET action = action + (@IncrementAmount) WHERE action > @CurrentAction AND submission = @SubmissionId AND run_number = @RunNumber;",
                _npgsql.Parameter("@IncrementAmount", NpgsqlDbType.Integer, incrementByAmount),
                _npgsql.Parameter("@CurrentAction", NpgsqlDbType.Integer, currentAction),
                _npgsql.Parameter("@RunNumber", NpgsqlDbType.Integer, currentRunNumber),
                _npgsql.Parameter("@SubmissionId", NpgsqlDbType.Integer, submissionId));

            updateChanges += await _npgsql.NonQuery(
                "UPDATE played_floors SET action = action + (@IncrementAmount) WHERE action > @CurrentAction AND submission = @Submission AND run_number = @RunNumber;",
                _npgsql.Parameter("@IncrementAmount", NpgsqlDbType.Integer, incrementByAmount),
                _npgsql.Parameter("@CurrentAction", NpgsqlDbType.Integer, currentAction),
                _npgsql.Parameter("@Submission", NpgsqlDbType.Integer, submissionId),
                _npgsql.Parameter("@RunNumber", NpgsqlDbType.Integer, currentRunNumber));

            updateChanges += await _npgsql.NonQuery(
                "UPDATE played_characters SET action = action + (@IncrementAmount) WHERE action > @CurrentAction AND submission = @Submission AND run_number = @RunNumber;",
                _npgsql.Parameter("@IncrementAmount", NpgsqlDbType.Integer, incrementByAmount),
                _npgsql.Parameter("@CurrentAction", NpgsqlDbType.Integer, currentAction),
                _npgsql.Parameter("@Submission", NpgsqlDbType.Integer, submissionId),
                _npgsql.Parameter("@RunNumber", NpgsqlDbType.Integer, currentRunNumber));

            return updateChanges;
        }

        public async Task<int> UpdateGameplayEventPlayer(UpdateGameplayEventPlayer updateGameplayEventPlayer)
        {
            if (updateGameplayEventPlayer.EventId is null)
            {
                return 0;
            }

            return await _npgsql.NonQuery(
                "UPDATE gameplay_events SET player = @Player WHERE id = @Id;",
                _npgsql.Parameter("@Player", NpgsqlDbType.Integer, updateGameplayEventPlayer.Player ?? (object)DBNull.Value),
                _npgsql.Parameter("@Id", NpgsqlDbType.Integer, updateGameplayEventPlayer.EventId.Value));
        }

        public async Task<int> UpdateGameplayEventWasRerolled(UpdateGameplayEventWasRerolled updateGameplayEventWasRerolled)
        {
            if (updateGameplayEventWasRerolled.EventId is null || updateGameplayEventWasRerolled.WasRerolled is null)
            {
                return 0;
            }

            return await _npgsql.NonQuery(
                "UPDATE gameplay_events SET was_rerolled = @Rerolled WHERE id = @Id;",
                _npgsql.Parameter("@Rerolled", NpgsqlDbType.Boolean, updateGameplayEventWasRerolled.WasRerolled),
                _npgsql.Parameter("@Id", NpgsqlDbType.Integer, updateGameplayEventWasRerolled.EventId));
        }

        public async Task<int> DeleteGameplayEvent(DeleteGameplayEvent deleteGameplayEvent)
        {
            if (deleteGameplayEvent.GameplayEventId is null)
            {
                return 0;
            }

            var gameplayEvent = await _isaac.GetGameplayEventById(deleteGameplayEvent.GameplayEventId.Value);

            if (gameplayEvent is null)
            {
                return 0;
            }

            var incrementResult = await IncrementActionNumberAfterEventWithId(gameplayEvent.Submission, gameplayEvent.Id, -1);

            if (incrementResult >= 0)
            {
                return await _npgsql.NonQuery(
                    "DELETE FROM gameplay_events WHERE id = @Id;",
                    _npgsql.Parameter("@Id", NpgsqlDbType.Integer, gameplayEvent.Id));
            }
            else
            {
                return 0;
            }
        }

        public async Task<int> InsertGameplayEventAfterEvent(InsertGameplayEvent insertEvent)
        {
            if (insertEvent.InsertAfterEvent is null 
                || insertEvent.PlayedCharacterId is null 
                || insertEvent.PlayedFloorId is null 
                || insertEvent.RunNumber is null 
                || insertEvent.FloorNumber is null)
            {
                return 0;
            }

            var gameplayEvent = await _isaac.GetGameplayEventById(insertEvent.InsertAfterEvent.Value);

            if (gameplayEvent is null)
            {
                return 0;
            }

            var incrementResult = await IncrementActionNumberAfterEventWithId(gameplayEvent.Submission, gameplayEvent.Id);

            if (incrementResult >= 0)
            {
                var commandText =
                    "INSERT INTO gameplay_events (" +
                        "event_type, " +
                        "resource_one, " +
                        "resource_two, " +
                        "played_floor, " +
                        "video, " +
                        "action, " +
                        "played_character, " +
                        "in_consequence_of, " +
                        "run_number, " +
                        "player, " +
                        "floor_number, " +
                        "submission, " +
                        "was_rerolled," +
                        "latest) " +
                    "VALUES (" +
                        "@EventType, " +
                        "@ResourceOne, " +
                        "@ResourceTwo, " +
                        "@PlayedFloor, " +
                        "@Video, " +
                        "@Action, " +
                        "@PlayedCharacter, " +
                        "@InConsequenceOf, " +
                        "@RunNumber, " +
                        "@Player, " +
                        "@FloorNumber, " +
                        "@Submission, " +
                        "@WasRerolled, " +
                        "@Latest" +
                    ");";

                return await _npgsql.NonQuery(commandText,
                    _npgsql.Parameter("@EventType", NpgsqlDbType.Integer, (int)insertEvent.NewEvent.EventType),
                    _npgsql.Parameter("@ResourceOne", NpgsqlDbType.Text, insertEvent.NewEvent.RelatedResource1),
                    _npgsql.Parameter("@ResourceTwo", NpgsqlDbType.Text, insertEvent.NewEvent.RelatedResource2 ?? (object)DBNull.Value),
                    _npgsql.Parameter("@PlayedFloor", NpgsqlDbType.Integer, insertEvent.PlayedFloorId),
                    _npgsql.Parameter("@Video", NpgsqlDbType.Text, insertEvent.VideoId),
                    _npgsql.Parameter("@Action", NpgsqlDbType.Integer, gameplayEvent.Action + 1),
                    _npgsql.Parameter("@PlayedCharacter", NpgsqlDbType.Integer, insertEvent.PlayedCharacterId),
                    _npgsql.Parameter("@InConsequenceOf", NpgsqlDbType.Integer, insertEvent.InConsequenceOf ?? (object)DBNull.Value),
                    _npgsql.Parameter("@RunNumber", NpgsqlDbType.Integer, insertEvent.RunNumber),
                    _npgsql.Parameter("@Player", NpgsqlDbType.Integer, insertEvent.NewEvent.Player ?? (object)DBNull.Value),
                    _npgsql.Parameter("@FloorNumber", NpgsqlDbType.Integer, insertEvent.FloorNumber),
                    _npgsql.Parameter("@Submission", NpgsqlDbType.Integer, gameplayEvent.Submission),
                    _npgsql.Parameter("@WasRerolled", NpgsqlDbType.Boolean, insertEvent.NewEvent.Rerolled),
                    _npgsql.Parameter("@Latest", NpgsqlDbType.Boolean, gameplayEvent.Latest)
                );
            }
            else
            {
                return 0;
            }
        }
    }
}



