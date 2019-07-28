using Newtonsoft.Json;
using System;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class Quote
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("at")]
        public int At { get; set; }

        [JsonProperty("quoteText")]
        public string QuoteText { get; set; } = string.Empty;

        [JsonProperty("contributor")]
        public string Contributor { get; set; } = string.Empty;

        [JsonIgnore]
        public DateTime SubmissionTime { get; set; }

        [JsonProperty("videoId")]
        public string VideoId { get; set; } = string.Empty;

        [JsonProperty("vote")]
        public Vote? Vote { get; set; } = null;
    }
}
