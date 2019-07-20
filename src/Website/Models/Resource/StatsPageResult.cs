using Newtonsoft.Json;
using Website.Models.Database;

namespace Website.Models.Resource
{
    public class StatsPageResult
    {
        [JsonProperty("history")]
        public ChartObject? History { get; set; }

        [JsonProperty("found_at_stats")]
        public ChartObject? FoundAtStats { get; set; }

        [JsonProperty("character_stats")]
        public ChartObject? CharacterStats { get; set; }

        [JsonProperty("curse_stats")]
        public ChartObject? CurseStats { get; set; }

        [JsonProperty("floor_stats")]
        public ChartObject? FloorStats { get; set; }

        [JsonProperty("transformation_item_ranking")]
        public ChartObject? TransformationItemRanking { get; set; }

        [JsonProperty("videos")]
        public NldbVideoResult? Videos { get; set; }
    }
}
