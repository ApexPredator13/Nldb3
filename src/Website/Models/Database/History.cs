using System.Collections.Generic;
using Website.Models.Database.Enums;
using Newtonsoft.Json;

namespace Website.Models.Database
{
    public class IsaacResourceImage
    {
        public IsaacResourceImage(int x, int y, int h, int w, ResourceType type)
        {
            X = x;
            Y = y;
            H = h;
            W = w;
            Type = type;
        }

        [JsonProperty("x")]
        public int X { get; set; }

        [JsonProperty("y")]
        public int Y { get; set; }

        [JsonProperty("h")]
        public int H { get; set; }

        [JsonProperty("w")]
        public int W { get; set; }

        [JsonProperty("type")]
        public ResourceType Type { get; set; }
    }

    public class History
    {
        [JsonProperty("characterHistory")]
        public List<CharacterHistory> CharacterHistory { get; set; } = new List<CharacterHistory>();
    }

    public class CharacterHistory
    {
        [JsonProperty("characterImage")]
        public IsaacResourceImage CharacterImage { get; set; } = new IsaacResourceImage(0, 0, 0, 0, ResourceType.Unspecified);

        [JsonProperty("floors")]
        public List<FloorHistory> Floors { get; set; } = new List<FloorHistory>();
    }

    public class FloorHistory
    {
        [JsonProperty("floorImage")]
        public IsaacResourceImage FloorImage { get; set; } = new IsaacResourceImage(0, 0, 0, 0, ResourceType.Unspecified);

        [JsonProperty("events")]
        public List<EventHistory> Events { get; set; } = new List<EventHistory>();
    }

    public class EventHistory
    {
        [JsonProperty("image")]
        public IsaacResourceImage Image { get; set; } = new IsaacResourceImage(0, 0, 0, 0, ResourceType.Unspecified);
    }
}
