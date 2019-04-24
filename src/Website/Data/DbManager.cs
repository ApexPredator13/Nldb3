using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Npgsql;
using Website.Services;

namespace Website.Data
{
    public class DbManager : IDbManager
    {
        private readonly IDbConnector _connector;
        private readonly IWebHostEnvironment _env;

        public DbManager(IDbConnector connector, IWebHostEnvironment env)
        {
            _connector = connector;
            _env = env;
        }

        void Execute(string query)
        {
            using (var c = _connector.Connect().Result)
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.ExecuteNonQuery();
                }
            }
        }

        public void DropTablesInDevMode()
        {
            if (!_env.IsDevelopment())
            {
                return;
            }

            string query =
                "DROP TABLE IF EXISTS transformation_items, encountered_items_transformations, experienced_transformations, encountered_trinkets, used_tarot_cards, swallowed_pills, used_runes, encountered_curses, " +
                "encountered_items, experienced_deaths, bossfights, played_floors, played_characters, video_submissions, videos, game_character_tags, " +
                "game_characters, trinket_tags, trinkets, threat_tags, threats, tarot_card_tags, tarot_cards, pill_tags, pills, rune_tags, runes, curse_tags, " +
                "curses, item_tags, items, item_source_tags, item_sources, other_consumable_tags, other_consumables, boss_tags, bosses, " +
                "floors, transformation_tags, transformations, mod_url, mods; ";

            Execute(query);
        }

        public void CreateAllTables()
        {
            CreateModTables();
            CreateTransformativeResourcesTable();
            CreateVideoTable();
            CreateVideoSubmissionTable();
            CreatePlayedCharacterTable();
            CreatePlayedFloorTable();
            CreateBossfightTable();
            CreateEncounteredItemsTable();
            CreateEncounteredCursesTable();
            CreateUsedRunesTable();
            CreateSwallowedPillsTable();
            CreateSwallowedPillsTable();
            CreateUsedTarotCardsTable();
            CreateEncounteredTrinketsTable();
            CreateExperiencedDeathsTable();
            CreateExperiencedTransformationsTable();
            CreateEncounteredItemsTransformationsTable();
        }

        private void CreateModTables()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS mods (" +
                    "id SERIAL PRIMARY KEY, " +
                    "name VARCHAR(256) NOT NULL" +
                "); " +
                "CREATE TABLE IF NOT EXISTS mod_url(" +
                    "id SERIAL PRIMARY KEY, " +
                    "url VARCHAR(256) NOT NULL, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "mod INTEGER REFERENCES mods (id) ON DELETE CASCADE ON UPDATE CASCADE" +
                ")";

            Execute(query);
        }

        private void CreateIsaacStuffTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS isaac_resources (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL UNIQUE, " +
                    "type INTEGER NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "h INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id) ON DELETE SET NULL ON UPDATE CASCADE, " +
                    "display_order INTEGER, " +
                    "difficulty INTEGER" +
                "); " +

                "CREATE TABLE IF NOT EXISTS tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "value INTEGER NOT NULL, " +
                    "isaac_resource VARCHAR(30) NOT NULL REFERENCES isaac_stuff (id) ON UPDATE CASCADE ON DELETE CASCADE" +
                "); ";

            Execute(query);
        }


        private void CreateVideoTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS videos (" +
                    "id CHAR(11) PRIMARY KEY, " +
                    "title VARCHAR(256) NOT NULL, " +
                    "published TIMESTAMP WITH TIME ZONE NOT NULL, " +
                    "duration INTEGER NOT NULL, " +
                    "needs_update BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "likes INTEGER, " +
                    "dislikes INTEGER, " +
                    "view_count INTEGER, " +
                    "favourite_count INTEGER, " +
                    "comment_count INTEGER" +
                "); ";

            Execute(query);
        }

        private void CreateVideoSubmissionTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS video_submissions (" +
                    "id SERIAL PRIMARY KEY, " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "sub TEXT NOT NULL REFERENCES \"AspNetUsers\" (\"Id\"), " +
                    $"s_type INTEGER NOT NULL DEFAULT {(int)Models.Database.Enums.SubmissionType.New}" +
                "); ";

            Execute(query);
        }

        private void CreatePlayedCharacterTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS played_characters (" +
                    "id SERIAL PRIMARY KEY, " +
                    "game_character VARCHAR(30) NOT NULL REFERENCES isaac_resources (id), " +
                    "submission INTEGER NOT NULL REFERENCES video_submissions (id), " +
                    "action INTEGER NOT NULL, " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id)" +
                "); ";

            Execute(query);
        }

        private void CreatePlayedFloorTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS played_floors (" +
                    "id SERIAL PRIMARY KEY, " +
                    "floor VARCHAR(30) NOT NULL REFERENCES floors (id), " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id) ," +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL" +
                "); ";

            Execute(query);
        }

        private void CreateBossfightTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS bossfights (" +
                    "id SERIAL PRIMARY KEY, " +
                    "boss VARCHAR(30) NOT NULL REFERENCES bosses (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL, " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateEncounteredItemsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS encountered_items (" +
                    "id SERIAL PRIMARY KEY, " +
                    "item VARCHAR(30) NOT NULL REFERENCES items (id), " +
                    "source VARCHAR(30) NOT NULL REFERENCES item_sources (id), " +
                    "usage INTEGER NOT NULL, " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL, " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateEncounteredItemsTransformationsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS item_transformation_progress (" +
                    "id SERIAL PRIMARY KEY, " +
                    "encountered_item INTEGER NOT NULL REFERENCES encountered_items (id), " +
                    "transformation VARCHAR(30) NOT NULL REFERENCES transformations (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL, " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                    "action INTEGER NOT NULL" +
                "); ";

            Execute(query);
        }

        private void CreateExperiencedTransformationsTable()
        {
            string query =
                "CREATE TABLE experienced_transformations (" +
                    "id SERIAL PRIMARY KEY, " +
                    "transformation VARCHAR(30) NOT NULL REFERENCES transformations (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "triggered_by INTEGER NOT NULL REFERENCES encountered_items (id), " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateEncounteredCursesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS encountered_curses (" +
                    "id SERIAL PRIMARY KEY, " +
                    "curse VARCHAR(30) NOT NULL REFERENCES curses (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL, " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateUsedRunesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS used_runes (" +
                    "id SERIAL PRIMARY KEY, " +
                    "rune VARCHAR(30) NOT NULL REFERENCES runes (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id), " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateSwallowedPillsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS swallowed_pills (" +
                    "id SERIAL PRIMARY KEY, " +
                    "pill VARCHAR(30) NOT NULL REFERENCES pills (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id), " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateUsedTarotCardsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS used_tarot_cards (" +
                    "id SERIAL PRIMARY KEY, " +
                    "tarot_card VARCHAR(30) NOT NULL REFERENCES tarot_cards (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id) ," +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }
        
        private void CreateEncounteredTrinketsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS encountered_trinkets (" +
                    "id SERIAL PRIMARY KEY, " +
                    "trinket VARCHAR(30) NOT NULL REFERENCES trinkets (id), " +
                    "usage INTEGER NOT NULL, " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id), " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateExperiencedDeathsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS experienced_deaths (" +
                    "id SERIAL PRIMARY KEY, " +
                    "threat VARCHAR(30) NOT NULL REFERENCES threats (id), " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL, " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id)" +
                "); ";

            Execute(query);
        }

        private void CreateTransformativeResourcesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS transformative_resources (" +
                    "id SERIAL PRIMARY KEY, " +
                    "isaac_resource VARCHAR(30) NOT NULL REFERENCES isaac_resources (id), " +
                    "transformation VARCHAR(30) NOT NULL REFERENCES isaac_resource (id), " +
                    "counts_multiple_times BOOLEAN NOT NULL, " +
                    "requires_title_content VARCHAR(100), " +
                    "valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2011-09-01 00:00:00+01', " +
                    "valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2100-01-01 00:00:00+01'" +
                "); ";

            Execute(query);
        }
    }
}
