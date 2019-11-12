using Newtonsoft.Json;

namespace Website.Models.Database
{
    public class MaxVideoStats
    {
        [JsonProperty("max_views")]
        public int MaxViews { get; set; } = 0;

        [JsonProperty("max_likes")]
        public int MaxLikes { get; set; } = 0;

        [JsonProperty("max_comments")]
        public int MaxComments { get; set; } = 0;

        [JsonProperty("max_dislikes")]
        public int MaxDislikes { get; set; } = 0;

        [JsonProperty("avg_views")]
        public float AverageViews { get; set; } = 0.0f;

        [JsonProperty("avg_likes")]
        public float AverageLikes { get; set; } = 0.0f;

        [JsonProperty("avg_comments")]
        public float AverageComments { get; set; } = 0.0f;

        [JsonProperty("avg_dislikes")]
        public float AverageDislikes { get; set; } = 0.0f;
    }
}


