using System.Collections.Generic;
using Website.Models.Database.Enums;

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

        public int X { get; set; }
        public int Y { get; set; }
        public int H { get; set; }
        public int W { get; set; }
        public ResourceType Type { get; set; }
    }

    public class History
    {
        public List<CharacterHistory> CharacterHistory { get; set; } = new List<CharacterHistory>();
    }

    public class CharacterHistory
    {
        public IsaacResourceImage CharacterImage { get; set; } = new IsaacResourceImage(0, 0, 0, 0, ResourceType.Unspecified);
        public List<FloorHistory> Floors { get; set; } = new List<FloorHistory>();
    }

    public class FloorHistory
    {
        public IsaacResourceImage FloorImage { get; set; } = new IsaacResourceImage(0, 0, 0, 0, ResourceType.Unspecified);
        public List<EventHistory> Events { get; set; } = new List<EventHistory>();
    }

    public class EventHistory
    {
        public IsaacResourceImage Image { get; set; } = new IsaacResourceImage(0, 0, 0, 0, ResourceType.Unspecified);
    }
}
