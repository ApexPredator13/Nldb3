using Newtonsoft.Json;

namespace Website.Models.FrontPage
{
    public class FrontPageResult
    {
        [JsonProperty("items_collected")]
        public int ItemsCollected { get; set; }
        
        [JsonProperty("bosses_fought")]
        public int BossesFought { get; set; }

        [JsonProperty("floors_visited")]
        public int FloorsVisited { get; set; }

        [JsonProperty("total_playtime_days")]
        public int TotalPlaytimeDays { get; set; }

        [JsonProperty("total_playtime_hours")]
        public int TotalPlaytimeHours { get; set; }

        [JsonProperty("total_playtime_minutes")]
        public int TotalPlaytimeMinutes { get; set; }

        [JsonProperty("total_playtime_seconds")]
        public int TotalPlaytimeSeconds { get; set; }

        [JsonProperty("characters_played")]
        public int CharactersPlayed { get; set; }

        [JsonProperty("characters_killed")]
        public int CharactersKilled { get; set; }


        [JsonProperty("moms_knife_runs")]
        public int MomsKnifeRuns { get; set; }

        [JsonProperty("guppy_runs")]
        public int GuppyRuns { get; set; }

        [JsonProperty("brimstone_runs")]
        public int BrimstoneRuns { get; set; }

        [JsonProperty("sacred_heart_runs")]
        public int SacredHeartRuns { get; set; }

        [JsonProperty("godhead_runs")]
        public int GodheadRuns { get; set; }


        [JsonProperty("mom_kills")]
        public int MomKills { get; set; }

        [JsonProperty("blue_baby_kills")]
        public int BlueBabyKills { get; set; }

        [JsonProperty("lamb_kills")]
        public int LambKills { get; set; }

        [JsonProperty("mega_satan_kills")]
        public int MegaSatanKills { get; set; }

        [JsonProperty("delirium_kills")]
        public int DeliriumKills { get; set; }


        [JsonProperty("average_items_total")]
        public float AverageItemsTotal { get; set; }

        [JsonProperty("average_items_shop")]
        public float AverageItemsShop { get; set; }

        [JsonProperty("average_floors_visited")]
        public float AverageFloorsVisited { get; set; }

        [JsonProperty("average_deaths")]
        public float AverageDeaths { get; set; }

        [JsonProperty("average_chest_items")]
        public float AverageChestItems { get; set; }

        [JsonProperty("average_bossfights")]
        public float AverageBossfights { get; set; }

        [JsonProperty("average_transformations")]
        public float AverageTransformations { get; set; }

        [JsonProperty("average_win_percentage")]
        public float AverageWinPercentage { get; set; }

        [JsonProperty("video_count")]
        public int VideoCount { get; set; }
    }
}
