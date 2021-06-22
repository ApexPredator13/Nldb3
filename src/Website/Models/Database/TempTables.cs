namespace Website.Models.Database
{
    public class TempTables
    {
        public TempTables(
            string tempVideoSubmissionsTable,
            string tempPlayedFloorsTable,
            string tempPlayedCharactersTable,
            string tempGameplayEventsTable,
            string tempVideoSubmissionsUserdata)
        {
            TempVideoSubmissionsTable = tempVideoSubmissionsTable;
            TempPlayedFloorsTable = tempPlayedFloorsTable;
            TempPlayedCharactersTable = tempPlayedCharactersTable;
            TempGameplayEventsTable = tempGameplayEventsTable;
            TempVideoSubmissionsUserdataTable = tempVideoSubmissionsUserdata;
        }

        public string TempVideoSubmissionsTable { get; set; }
        public string TempPlayedFloorsTable { get; set; }
        public string TempPlayedCharactersTable { get; set; }
        public string TempGameplayEventsTable { get; set; }
        public string TempVideoSubmissionsUserdataTable { get; set; }

        public static TempTables UseRealTableNames()
        {
            return new TempTables("video_submissions", "played_floors", "played_characters", "gameplay_events", "video_submissions_userdata");
        }
    }
}
