using Newtonsoft.Json;
using System.Collections.Generic;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class IsaacResource
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("resource_type")]
        public ResourceType ResourceType { get; set; } = ResourceType.Unspecified;

        [JsonProperty("exists_in")]
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;

        [JsonProperty("x")]
        public int X { get; set; } = 0;

        [JsonProperty("y")]
        public int Y { get; set; } = 0;

        [JsonProperty("w")]
        public int W { get; set; } = 0;

        [JsonProperty("h")]
        public int H { get; set; } = 0;

        [JsonProperty("game_mode")]
        public GameMode GameMode { get; set; } = GameMode.Unspecified;

        [JsonProperty("color")]
        public string Color { get; set; } = string.Empty;

        [JsonProperty("mod")]
        public Mod? Mod { get; set; } = null;

        [JsonProperty("tags")]
        public List<Tag> Tags { get; set; } = new List<Tag>();

        [JsonProperty("display_order")]
        public int? DisplayOrder { get; set; } = null;

        [JsonProperty("difficulty")]
        public int? Difficulty { get; set; } = null;
    }
}


