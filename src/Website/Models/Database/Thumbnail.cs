using Newtonsoft.Json;

namespace Website.Models.Database
{
    public class NldbThumbnail
    {
        [JsonProperty("id")]
        public int Id { get; set; } = 0;

        [JsonProperty("url")]
        public string Url { get; set; } = string.Empty;

        [JsonProperty("width")]
        public int? Width { get; set; } = null;

        [JsonProperty("height")]
        public int? Height { get; set; } = null;
    }
}
