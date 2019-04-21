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
                "DROP TABLE IF EXISTS encountered_trinkets, used_tarot_cards, swallowed_pills, used_runes, encountered_curses, " +
                "encountered_items, experienced_deaths, bossfights, played_floors, played_characters, video_submissions, videos, game_character_tags, " +
                "game_characters, trinket_tags, trinkets, threat_tags, threats, tarot_card_tags, tarot_cards, pill_tags, pills, rune_tags, runes, curse_tags, " +
                "curses, item_tags, items, item_source_tags, item_sources, other_consumable_tags, other_consumables, boss_tags, bosses, " +
                "floor_tags, floors, transformation_tags, transformations, mod_url, mods; ";

            Execute(query);
        }

        public void CreateAllTables()
        {
            CreateModsTable();
            CreateModUrlTable();
            CreateFloorsTable();
            CreateFloorTagsTable();
            CreateBossesTable();
            CreateBossTagsTable();
            CreateTransformationsTable();
            CreateTransformationTagsTable();
            CreateItemSourcesTable();
            CreateItemSourceTagsTable();
            CreateItemsTable();
            CreateItemTagsTable();
            CreateCursesTable();
            CreateCurseTagsTable();
            CreateOtherConsumablesTable();
            CreateOtherConsumableTagsTable();
            CreateRunesTable();
            CreateRuneTagsTable();
            CreatePillsTable();
            CreatePillTagsTable();
            CreateTarotCardsTable();
            CreateTarotCardTagsTable();
            CreateTrinketsTable();
            CreateTrinketTagsTable();
            CreateThreatsTable();
            CreateThreatTagsTable();
            CreateCharactersTable();
            CreateCharacterTagTable();
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
        }

        private void CreateModsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS mods (" +
                    "id SERIAL PRIMARY KEY, " +
                    "name VARCHAR(256) NOT NULL" +
                ")";

            Execute(query);
        }

        private void CreateModUrlTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS mod_url (" +
                    "id SERIAL PRIMARY KEY, " +
                    "url VARCHAR(256) NOT NULL, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "mod INTEGER REFERENCES mods (id)" +
                ")";

            Execute(query);
        }

        private void CreateFloorsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS floors (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL, " +
                    "mod INTEGER REFERENCES mods (id)" +
                "); ";

            Execute(query);
        }

        private void CreateFloorTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS floor_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "floor VARCHAR(30) NOT NULL REFERENCES floors (id)" +
                "); ";

            Execute(query);
        }

        private void CreateBossesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS bosses (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "double_trouble BOOLEAN NOT NULL, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id)" +
                ")";

            Execute(query);
        }

        private void CreateBossTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS boss_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "boss VARCHAR(30) NOT NULL REFERENCES bosses (id)" +
                "); ";

            Execute(query);
        }

        private void CreateTransformationsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS transformations (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id), " +
                    "items_needed INTEGER NOT NULL, " +
                    "valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2011-09-01 00:00:00+01', " +
                    "valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2100-01-01 00:00:00+01'" +
                ")";

            Execute(query);
        }

        private void CreateTransformationTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS transformation_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) NOT NULL REFERENCES transformations (id)" +
                "); ";

            Execute(query);
        }

        private void CreateItemSourcesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS item_sources (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id)" +
                ")";

            Execute(query);
        }

        private void CreateItemSourceTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS item_source_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "item_source VARCHAR(30) NOT NULL REFERENCES item_sources (id)" +
                "); ";

            Execute(query);
        }

        private void CreateItemsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS items (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id), " +
                    "transformation VARCHAR(30) DEFAULT NULL REFERENCES transformations (id)" +
                ")";

            Execute(query);
        }

        private void CreateItemTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS item_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "item VARCHAR(30) NOT NULL REFERENCES items (id)" +
                "); ";

            Execute(query);
        }

        private void CreateCursesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS curses (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id)" +
                ")";

            Execute(query);
        }

        private void CreateCurseTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS curse_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "curse VARCHAR(30) NOT NULL REFERENCES curses (id)" +
                "); ";

            Execute(query);
        }

        private void CreateRunesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS runes (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id), " +
                    "transformation VARCHAR(30) DEFAULT NULL REFERENCES transformations (id)" +
                ")";

            Execute(query);
        }

        private void CreateRuneTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS rune_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "rune VARCHAR(30) NOT NULL REFERENCES runes (id)" +
                "); ";

            Execute(query);
        }

        private void CreatePillsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS pills (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id), " +
                    "transformation VARCHAR(30) DEFAULT NULL REFERENCES transformations (id)" +
                ")";

            Execute(query);
        }

        private void CreatePillTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS pill_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "pill VARCHAR(30) NOT NULL REFERENCES pills (id)" +
                "); ";

            Execute(query);
        }

        private void CreateTarotCardsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS tarot_cards (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id), " +
                    "transformation VARCHAR(30) DEFAULT NULL REFERENCES transformations (id)" +
                ")";

            Execute(query);
        }

        private void CreateTarotCardTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS tarot_card_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "tarot_card VARCHAR(30) NOT NULL REFERENCES tarot_cards (id)" +
                "); ";

            Execute(query);
        }

        private void CreateTrinketsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS trinkets (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id), " +
                    "transformation VARCHAR(30) DEFAULT NULL REFERENCES transformations (id)" +
                ")";

            Execute(query);
        }

        private void CreateTrinketTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS trinket_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "trinket VARCHAR(30) NOT NULL REFERENCES trinkets (id)" +
                "); ";

            Execute(query);
        }

        private void CreateOtherConsumablesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS other_consumables (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id), " +
                    "transformation VARCHAR(30) DEFAULT NULL REFERENCES transformations (id)" +
                ")";

            Execute(query);
        }

        private void CreateOtherConsumableTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS other_consumable_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "other_consumable VARCHAR(30) NOT NULL REFERENCES other_consumables (id)" +
                "); ";

            Execute(query);
        }

        private void CreateThreatsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS threats (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id)" +
                ")";

            Execute(query);
        }

        private void CreateThreatTagsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS threat_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "threat VARCHAR(30) NOT NULL REFERENCES threats (id)" +
                "); ";

            Execute(query);
        }

        private void CreateCharactersTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS game_characters (" +
                    "id VARCHAR(30) PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x INTEGER NOT NULL, " +
                    "y INTEGER NOT NULL, " +
                    "w INTEGER NOT NULL, " +
                    "game_mode INTEGER NOT NULL, " +
                    "color VARCHAR(25) NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id)" +
                ")";

            Execute(query);
        }

        private void CreateCharacterTagTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS game_character_tags (" +
                    "id SERIAL PRIMARY KEY, " +
                    "type INTEGER NOT NULL, " +
                    "game_character VARCHAR(30) NOT NULL REFERENCES game_characters (id)" +
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
                    "game_character VARCHAR(30) NOT NULL REFERENCES game_characters (id), " +
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
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id)" +
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
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id)" +
                "); ";

            Execute(query);
        }

        private void CreateEncounteredCursesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS encountered_curses (" +
                    "id SERIAL PRIMARY KEY, " +
                    "curse VARCHAR(30) NOT NULL REFERENCES curses (id), " +
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL" +
                "); ";

            Execute(query);
        }

        private void CreateUsedRunesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS used_runes (" +
                    "id SERIAL PRIMARY KEY, " +
                    "rune VARCHAR(30) NOT NULL REFERENCES runes (id), " +
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id)" +
                "); ";

            Execute(query);
        }

        private void CreateSwallowedPillsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS swallowed_pills (" +
                    "id SERIAL PRIMARY KEY, " +
                    "pill VARCHAR(30) NOT NULL REFERENCES pills (id), " +
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id)" +
                "); ";

            Execute(query);
        }

        private void CreateUsedTarotCardsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS used_tarot_cards (" +
                    "id SERIAL PRIMARY KEY, " +
                    "tarot_card VARCHAR(30) NOT NULL REFERENCES tarot_cards (id), " +
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id)" +
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
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "action INTEGER NOT NULL, " +
                    "transformation VARCHAR(30) REFERENCES transformations (id)" +
                "); ";

            Execute(query);
        }

        private void CreateExperiencedDeathsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS experienced_deaths (" +
                    "id SERIAL PRIMARY KEY, " +
                    "threat VARCHAR(30) NOT NULL REFERENCES threats (id), " +
                    "floor INTEGER NOT NULL REFERENCES played_floors (id), " +
                    "video CHAR(11) NOT NULL REFERENCES videos (id), " +
                    "action INTEGER NOT NULL" +
                "); ";

            Execute(query);
        }
    }
}
