using Newtonsoft.Json;
using System.Collections.Generic;

namespace Website.Models.Database
{
    public class NldbVideoResult
    {
        [JsonProperty("videos")]
        public List<NldbVideo> Videos { get; set; } = new List<NldbVideo>();

        [JsonProperty("video_count")]
        public int VideoCount { get; set; } = 0;

        [JsonProperty("amount_per_page")]
        public int AmountPerPage { get; set; } = 0;

        [JsonProperty("header")]
        public string Header { get; set; } = "Videos";
    }
}
