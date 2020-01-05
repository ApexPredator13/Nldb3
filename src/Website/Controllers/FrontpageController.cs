using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.FrontPage;
using Website.Services;

namespace Website.Controllers
{
    [Area("api"), Route("[area]/frontpage"), ApiController]
    public class FrontpageController : Controller
    {
        private readonly INpgsql _connector;
        private readonly IConfiguration _config;

        public FrontpageController(INpgsql connector, IConfiguration config)
        {
            _config = config;
            _connector = connector;
        }

        [HttpGet("top-users")]
        public async Task<List<FrontPageTopUser>> GetTopUsers()
        {
            var foundUsers = new List<FrontPageTopUser>();

            var commandText =
                "SELECT COUNT(public.video_submissions_userdata.user_id) AS submission_count, identity.\"AspNetUsers\".\"UserName\" AS username " +
                "FROM public.video_submissions_userdata " +
                "LEFT JOIN identity.\"AspNetUsers\" " +
                "ON public.video_submissions_userdata.user_id = identity.\"AspNetUsers\".\"Id\" " +
                "WHERE identity.\"AspNetUsers\".\"UserName\" NOT IN (@AdminUsername)" +
                "GROUP BY username " +
                "ORDER BY submission_count DESC " +
                "LIMIT 25;";

            using var connection = await _connector.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@AdminUsername", NpgsqlDbType.Text, _config["AdminUsername"]);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    foundUsers.Add(new FrontPageTopUser(reader.GetString(1), reader.GetInt32(0)));
                }
            }

            return foundUsers;
        }

        [HttpGet]
        public async Task<ActionResult<FrontPageResult>> Get()
        {
            var commandText =
                "WITH " +
                    "floor_count AS (SELECT COUNT(*) AS played_floors FROM played_floors), " +
                    "video_count AS (SELECT COUNT(*) AS video_count FROM videos), " +
                    "character_count AS (SELECT COUNT(*) AS played_characters FROM played_characters), " +
                    "playtime AS (SELECT SUM(duration) AS total_duration FROM videos), " +
                    "event_data AS (" +
                        "SELECT " +
                            "SUM(CASE WHEN event_type = 2 OR event_type = 18 THEN 1 ELSE 0 END) AS collected_items, " +
                            "SUM(CASE WHEN event_type = 4 THEN 1 ELSE 0 END) AS bossfights, " +
                            "SUM(CASE WHEN event_type = 17 THEN 1 ELSE 0 END) AS characters_killed, " +
                            "SUM(CASE WHEN event_type = 2 AND resource_one = 'MomsKnife' THEN 1 ELSE 0 END) AS moms_knife_runs, " +
                            "SUM(CASE WHEN event_type = 2 AND resource_one = 'Brimstone' THEN 1 ELSE 0 END) AS brimstone_runs, " +
                            "SUM(CASE WHEN event_type = 11 AND resource_two = 'Guppy' THEN 1 ELSE 0 END) AS guppy_runs, " +
                            "SUM(CASE WHEN event_type = 2 AND resource_one = 'SacredHeart' THEN 1 ELSE 0 END) AS sacred_heart_runs, " +
                            "SUM(CASE WHEN event_type = 2 AND resource_one = 'Godhead' THEN 1 ELSE 0 END) AS godhead_runs, " +
                            "SUM(CASE WHEN event_type = 4 AND resource_one = 'Mom' THEN 1 ELSE 0 END) AS mom_kills, " +
                            "SUM(CASE WHEN event_type = 4 AND resource_one = 'BlueBabyBoss' THEN 1 ELSE 0 END) AS blue_baby_kills, " +
                            "SUM(CASE WHEN event_type = 4 AND resource_one = 'TheLamb' THEN 1 ELSE 0 END) AS lamb_kills, " +
                            "SUM(CASE WHEN event_type = 4 AND resource_one = 'Delirium' THEN 1 ELSE 0 END) AS delirium_kills, " +
                            "SUM(CASE WHEN event_type = 4 AND resource_one = 'MegaSatan' THEN 1 ELSE 0 END) AS mega_satan_kills, " +
                            "SUM(CASE WHEN(event_type = 2 OR event_type = 18) AND resource_two = 'Shop' THEN 1 ELSE 0 END) AS average_shop_items, " +
                            "SUM(CASE WHEN(event_type = 2 OR event_type = 18) AND resource_two = 'ChestItem' THEN 1 ELSE 0 END) AS chest_items, " +
                            "SUM(CASE WHEN event_type = 1 THEN 1 ELSE 0 END) AS transformations " +
                        "FROM gameplay_events" +
                    ") " +
                "SELECT " +
                    "event_data.collected_items, " +
                    "event_data.bossfights, " +
                    "floor_count.played_floors, " +
                    "character_count.played_characters, " +
                    "playtime.total_duration, " +
                    "event_data.characters_killed, " +
                    "event_data.moms_knife_runs, " +
                    "event_data.brimstone_runs, " +
                    "event_data.guppy_runs, " +
                    "event_data.sacred_heart_runs, " +
                    "event_data.godhead_runs, " +
                    "event_data.mom_kills, " +
                    "event_data.blue_baby_kills, " +
                    "event_data.lamb_kills, " +
                    "event_data.delirium_kills, " +
                    "event_data.mega_satan_kills, " +
                    "event_data.collected_items::REAL / character_count.played_characters::REAL AS average_items_per_run, " +
                    "event_data.average_shop_items::REAL / character_count.played_characters::REAL AS average_shop_items_per_run, " +
                    "floor_count.played_floors::REAL / character_count.played_characters::REAL AS average_floor_count_per_run, " +
                    "event_data.characters_killed::REAL / character_count.played_characters::REAL AS average_character_kills_per_run, " +
                    "event_data.chest_items::REAL / character_count.played_characters::REAL AS average_chest_items_per_run, " +
                    "event_data.bossfights::REAL / character_count.played_characters::REAL AS average_bossfights_per_run, " +
                    "event_data.transformations::REAL / character_count.played_characters::REAL AS average_transformations_per_run, " +
                    "100::REAL - (100::REAL * event_data.characters_killed::REAL) / character_count.played_characters::REAL AS chance_to_win, " +
                    "video_count.video_count AS video_count " +
                "FROM floor_count, event_data, character_count, playtime, video_count;";

            using var connection = await _connector.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                reader.Read();

                var playtime = TimeSpan.FromSeconds(reader.GetInt32(4));

                return new FrontPageResult()
                {
                    ItemsCollected = reader.GetInt32(0),
                    BossesFought = reader.GetInt32(1),
                    FloorsVisited = reader.GetInt32(2),
                    CharactersPlayed = reader.GetInt32(3),
                    TotalPlaytimeDays = playtime.Days,
                    TotalPlaytimeHours = playtime.Hours,
                    TotalPlaytimeMinutes = playtime.Minutes,
                    TotalPlaytimeSeconds = playtime.Seconds,
                    CharactersKilled = reader.GetInt32(5),
                    MomsKnifeRuns = reader.GetInt32(6),
                    BrimstoneRuns = reader.GetInt32(7),
                    GuppyRuns = reader.GetInt32(8),
                    SacredHeartRuns = reader.GetInt32(9),
                    GodheadRuns = reader.GetInt32(10),
                    MomKills = reader.GetInt32(11),
                    BlueBabyKills = reader.GetInt32(12),
                    LambKills = reader.GetInt32(13),
                    DeliriumKills = reader.GetInt32(14),
                    MegaSatanKills = reader.GetInt32(15),
                    AverageItemsTotal = reader.GetFloat(16),
                    AverageItemsShop = reader.GetFloat(17),
                    AverageFloorsVisited = reader.GetFloat(18),
                    AverageDeaths = reader.GetFloat(19),
                    AverageChestItems = reader.GetFloat(20),
                    AverageBossfights = reader.GetFloat(21),
                    AverageTransformations = reader.GetFloat(22),
                    AverageWinPercentage = reader.GetFloat(23),
                    VideoCount = reader.GetInt32(24)
                };
            }
            else
            {
                return NotFound();
            }
        }
    }
}
