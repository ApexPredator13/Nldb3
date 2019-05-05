using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;
using Website.Models.Database.Enums;
using Website.Services;

namespace Website.Data
{
    public class DbManager : IDbManager
    {
        private readonly IDbConnector _connector;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public DbManager(IDbConnector connector, IWebHostEnvironment env, IConfiguration config)
        {
            _connector = connector;
            _env = env;
            _config = config;
        }

        void Execute(string query)
        {
            using var c = _connector.Connect().Result;
            using var q = new NpgsqlCommand(query, c);
            q.ExecuteNonQuery();
        }

        public void DropTablesInDevMode()
        {
            if (!_env.IsDevelopment())
            {
                return;
            }

            string query = "DROP TABLE IF EXISTS mods, mod_url, isaac_resources, tags, thumbnails, videos, video_submissions, played_characters, played_floors, gameplay_events, transformative_resources; ";

            Execute(query);
        }

        public void CreateAllTables()
        {
            CreateModTables();
            CreateIsaacResourcesTable();
            CreateTransformativeResourcesTable();
            CreateVideoTable();
            CreateVideoSubmissionTable();
            CreatePlayedCharacterTable();
            CreatePlayedFloorTable();
            CreateGameplayEventsTable();
        }

        private void CreateModTables()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS mods (" +
                    "id SERIAL PRIMARY KEY, " +
                    "name TEXT NOT NULL" +
                "); " +
                "CREATE TABLE IF NOT EXISTS mod_url(" +
                    "id SERIAL PRIMARY KEY, " +
                    "url TEXT NOT NULL, " +
                    "name TEXT NOT NULL, " +
                    "mod INTEGER REFERENCES mods (id) ON DELETE CASCADE ON UPDATE CASCADE" +
                ")";

            Execute(query);
        }

        private void CreateIsaacResourcesTable()
        {
            // create table
            string query =
                "CREATE TABLE IF NOT EXISTS isaac_resources (" +
                    "id TEXT CHECK (char_length(id) <= 30) PRIMARY KEY, " +
                    "name TEXT NOT NULL, " +
                    "type INTEGER NOT NULL, " +
                    "exists_in INTEGER NOT NULL, " +
                    "x BOX NOT NULL DEFAULT '((0,0),(0,0))', " +
                    "game_mode INTEGER NOT NULL, " +
                    "color TEXT NOT NULL DEFAULT 'LightGray', " +
                    "mod INTEGER REFERENCES mods (id) ON DELETE SET NULL ON UPDATE CASCADE, " +
                    "display_order INTEGER, " +
                    "difficulty INTEGER, " +
                    "tags INTEGER[] DEFAULT NULL" +
                "); " +

                // create default entries
                "INSERT INTO isaac_resources (id, name, type, exists_in, x, game_mode, color, mod, display_order, difficulty) VALUES " +
                $"('MissingCharacter', 'Missing Character', {(int)ResourceType.Character}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingCurse', 'Missing Curse', {(int)ResourceType.Curse}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingOtherEvent', 'Missing Event', {(int)ResourceType.OtherEvent}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingFloor', 'Missing Floor', {(int)ResourceType.Floor}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingItem', 'Missing Item', {(int)ResourceType.Item}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingItemSource', 'Missing Itemsource', {(int)ResourceType.ItemSource}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingPill', 'Missing Pill', {(int)ResourceType.Pill}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingRune', 'Missing Rune', {(int)ResourceType.Rune}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingTarotCard', 'Missing Tarot Card', {(int)ResourceType.TarotCard}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingEnemy', 'Missing Enemy', {(int)ResourceType.Enemy}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingTransformation', 'Missing Transformation', {(int)ResourceType.Transformation}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingTrinket', 'Missing Trinket', {(int)ResourceType.Trinket}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('MissingBoss', 'Missing Boss', {(int)ResourceType.Boss}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL), " +
                $"('DeletedResource', 'Deleted Resource', {(int)ResourceType.Unspecified}, {(int)ExistsIn.Nowhere}, '((-1,-1),(-1,-1))', {(int)GameMode.Unspecified}, DEFAULT, NULL, NULL, NULL); ";

            Execute(query);
        }


        private void CreateVideoTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS videos (" +
                    $"id TEXT PRIMARY KEY{(_env.IsDevelopment() ? string.Empty : " CHECK (char_length(id) = 11)")}, " +     // igore fixed 11 character length in dev mode for easier testing
                    "title TEXT NOT NULL, " +
                    "published TIMESTAMP WITH TIME ZONE, " +
                    "duration INTEGER NOT NULL, " +
                    "needs_update BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "likes INTEGER, " +
                    "dislikes INTEGER, " +
                    "view_count INTEGER, " +
                    "favourite_count INTEGER, " +
                    "comment_count INTEGER, " +
                    "tags TEXT[], " +
                    "is_3d BOOLEAN, " +
                    "is_hd BOOLEAN, " +
                    "cc BOOLEAN" +
                "); " +
                
                "CREATE TABLE thumbnails (" +
                    "id SERIAL PRIMARY KEY, " +
                    "url TEXT NOT NULL, " +
                    "width INTEGER, " +
                    "height INTEGER, " +
                    "video TEXT NOT NULL REFERENCES videos (id) ON UPDATE CASCADE ON DELETE CASCADE" +
                "); ";

            Execute(query);
        }

        private void CreateVideoSubmissionTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS video_submissions (" +
                    "id SERIAL PRIMARY KEY, " +
                    "video TEXT NOT NULL REFERENCES videos (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    $"sub TEXT NOT NULL DEFAULT '{_config["DeletedUserId"]}' REFERENCES \"AspNetUsers\" (\"Id\") ON UPDATE CASCADE ON DELETE SET DEFAULT, " +
                    $"s_type INTEGER NOT NULL DEFAULT {(int)SubmissionType.New}, " +
                    "latest BOOLEAN NOT NULL DEFAULT TRUE" +
                "); ";

            Execute(query);
        }

        private void CreatePlayedCharacterTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS played_characters (" +
                    "id SERIAL PRIMARY KEY, " +
                    "game_character TEXT NOT NULL DEFAULT 'DeletedResource' REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE SET DEFAULT, " +
                    "submission INTEGER NOT NULL REFERENCES video_submissions (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "action INTEGER NOT NULL, " +
                    "video TEXT NOT NULL REFERENCES videos (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "run_number INTEGER NOT NULL DEFAULT 1, " +
                    "died_from TEXT REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE SET NULL" +
                "); ";

            Execute(query);
        }

        private void CreatePlayedFloorTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS played_floors (" +
                    "id SERIAL PRIMARY KEY, " +
                    "floor TEXT NOT NULL REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id) ON UPDATE CASCADE ON DELETE CASCADE," +
                    "video TEXT NOT NULL REFERENCES videos (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "action INTEGER NOT NULL, " +
                    "run_number INTEGER NOT NULL, " +
                    "floor_number INTEGER NOT NULL, " +
                    "died_from TEXT REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE SET NULL, " +
                    "submission INTEGER NOT NULL REFERENCES video_submissions (id) ON UPDATE CASCADE ON DELETE CASCADE" +
                "); ";

            Execute(query);
        }

        private void CreateGameplayEventsTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS gameplay_events (" +
                    "id SERIAL PRIMARY KEY, " +
                    "event_type INTEGER NOT NULL, " +
                    "resource_one TEXT NOT NULL DEFAULT 'DeletedResource' REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE SET DEFAULT, " +
                    "resource_two TEXT REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE SET NULL, " +
                    "resource_three INTEGER, " +
                    "played_floor INTEGER NOT NULL REFERENCES played_floors (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "video TEXT NOT NULL REFERENCES videos (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "action INTEGER NOT NULL, " +
                    "played_character INTEGER NOT NULL REFERENCES played_characters (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "in_consequence_of INTEGER REFERENCES gameplay_events (id) ON UPDATE CASCADE ON DELETE SET NULL, " +
                    "run_number INTEGER NOT NULL, " +
                    "player INTEGER, " +
                    "floor_number INTEGER NOT NULL, " +
                    "submission INTEGER NOT NULL REFERENCES video_submissions (id) ON UPDATE CASCADE ON DELETE CASCADE" +
                "); ";

            Execute(query);
        }

        private void CreateTransformativeResourcesTable()
        {
            string query =
                "CREATE TABLE IF NOT EXISTS transformative_resources (" +
                    "id SERIAL PRIMARY KEY, " +
                    "isaac_resource TEXT NOT NULL REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "transformation TEXT NOT NULL REFERENCES isaac_resources (id) ON UPDATE CASCADE ON DELETE CASCADE, " +
                    "counts_multiple_times BOOLEAN NOT NULL, " +
                    "requires_title_content TEXT, " +
                    "valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2011-09-01 00:00:00+01', " +
                    "valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2100-01-01 00:00:00+01', " +
                    "steps_needed INTEGER NOT NULL DEFAULT 3" +
                "); ";

            Execute(query);
        }
    }
}
