using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NpgsqlTypes;
using Website.Infrastructure;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Route("RandomEpisode")]
    public class RandomEpisodeController : Controller
    {
        private readonly INpgsql _npgsql;

        public RandomEpisodeController(INpgsql npgsql)
        {
            _npgsql = npgsql;
        }

        [HttpGet("{type}")]
        public async Task<ActionResult> Get([FromRoute] string type)
        {
            using var connection = await _npgsql.Connect();

            using var command = type.ToLower() switch
            {
                "vanilla" 
                => _npgsql.Command(
                    connection, 
                    "SELECT id FROM videos WHERE published >= @Start AND published <= @End ORDER BY RANDOM() LIMIT 1;", 
                    _npgsql.Parameter("@Start", NpgsqlDbType.TimestampTz, ImportantDates.vanillaStart),
                    _npgsql.Parameter("@End", NpgsqlDbType.TimestampTz, ImportantDates.vanillaEnd)),

                var _ when type == "wotl" || type == "wrathofthelamb"
                => _npgsql.Command(
                    connection,
                    "SELECT id FROM videos WHERE published >= @Start AND published <= @End ORDER BY RANDOM() LIMIT 1;", 
                    _npgsql.Parameter("@Start", NpgsqlDbType.TimestampTz, ImportantDates.wotlStart),
                    _npgsql.Parameter("@End", NpgsqlDbType.TimestampTz, ImportantDates.wotlEnd)),

                "communityremix"
                => _npgsql.Command(
                    connection,
                    "SELECT id FROM videos WHERE LOWER(title) LIKE '%community remix%' ORDER BY RANDOM() LIMIT 1;"),

                "rebirth"
                => _npgsql.Command(
                    connection, 
                    "SELECT id FROM videos WHERE published >= @Start AND published <= @End ORDER BY RANDOM() LIMIT 1;", 
                    _npgsql.Parameter("@Start", NpgsqlDbType.TimestampTz, ImportantDates.rebirthStart),
                    _npgsql.Parameter("@End", NpgsqlDbType.TimestampTz, ImportantDates.rebirthEnd)),

                "afterbirth"
                => _npgsql.Command(
                    connection, 
                    "SELECT id FROM videos WHERE published >= @Start AND published <= @End ORDER BY RANDOM() LIMIT 1;", 
                    _npgsql.Parameter("@Start", NpgsqlDbType.TimestampTz, ImportantDates.afterbirthStart),
                    _npgsql.Parameter("@End", NpgsqlDbType.TimestampTz, ImportantDates.afterbirthEnd)),

                "afterbirthplus"
                => _npgsql.Command(
                    connection, 
                    "SELECT id FROM videos WHERE published >= @Start AND published <= @End ORDER BY RANDOM() LIMIT 1;", 
                    _npgsql.Parameter("@Start", NpgsqlDbType.TimestampTz, ImportantDates.afterbirthPlusStart),
                    _npgsql.Parameter("@End", NpgsqlDbType.TimestampTz, new DateTime(2100, 1, 1))),

                "antibirth"
                => _npgsql.Command(
                    connection,
                    "SELECT id FROM videos WHERE LOWER(title) LIKE '%antibirth%' ORDER BY RANDOM() LIMIT 1;"),

                _ => _npgsql.Command(connection, "SELECT id FROM videos ORDER BY RANDOM() LIMIT 1;")
            };

            using var reader = await command.ExecuteReaderAsync();

            if (!reader.HasRows)
            {
                return NotFound();
            }

            reader.Read();
            
            var id = reader.GetString(0);

            return Ok(id);
        }
    }
}

