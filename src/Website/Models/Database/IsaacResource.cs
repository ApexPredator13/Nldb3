using Newtonsoft.Json;
using NpgsqlTypes;
using System.Collections.Generic;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class IsaacResource
    {
        [JsonIgnore]
        public NpgsqlBox CssCoordinates { get; set; } = new NpgsqlBox(0, 0, 0, 0);


        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("resource_type")]
        public ResourceType ResourceType { get; set; } = ResourceType.Unspecified;

        [JsonProperty("exists_in")]
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;

        [JsonProperty("x")]
        public int X { get { return (int)CssCoordinates.Left; } }

        [JsonProperty("y")]
        public int Y { get { return (int)CssCoordinates.Top * -1; } }

        [JsonProperty("w")]
        public int W { get { return (int)CssCoordinates.Width + 1; } }

        [JsonProperty("h")]
        public int H { get { return (int)CssCoordinates.Height + 1; } }

        [JsonProperty("game_mode")]
        public GameMode GameMode { get; set; } = GameMode.Unspecified;

        [JsonProperty("color")]
        public string Color { get; set; } = string.Empty;

        [JsonProperty("mod")]
        public Mod? Mod { get; set; } = null;

        [JsonProperty("tags")]
        public List<Effect>? Tags { get; set; } = null;

        [JsonProperty("display_order")]
        public int? DisplayOrder { get; set; } = null;

        [JsonProperty("difficulty")]
        public int? Difficulty { get; set; } = null;
    }
}


