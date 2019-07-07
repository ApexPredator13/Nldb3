using Newtonsoft.Json;

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
    }
}
