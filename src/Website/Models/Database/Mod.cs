using System.Collections.Generic;
using Newtonsoft.Json;

namespace Website.Models.Database
{
    public class Mod
    {
        [JsonProperty("id")]
        public int Id { get; set; } = 0;

        [JsonProperty("name")]
        public string ModName { get; set; } = string.Empty;

        [JsonProperty("links")]
        public List<ModUrl> ModUrls { get; set; } = new List<ModUrl>();
    }
}
