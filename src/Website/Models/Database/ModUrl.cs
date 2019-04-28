using Newtonsoft.Json;

namespace Website.Models.Database
{
    public class ModUrl
    {
        [JsonProperty("id")]
        public int Id { get; set; } = 0;

        [JsonProperty("url")]
        public string Url { get; set; } = string.Empty;

        [JsonProperty("link_text")]
        public string LinkText { get; set; } = string.Empty;
    }
}
