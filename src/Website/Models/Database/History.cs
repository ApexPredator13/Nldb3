using System.Collections.Generic;

namespace Website.Models.Database
{
    public class IsaacResourceImage
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int H { get; set; }
        public int W { get; set; }
    }

    public class History
    {
        public List<CharacterHistory> CharacterHistory { get; set; } = new List<CharacterHistory>();
    }

    public class CharacterHistory
    {
        public IsaacResourceImage CharacterImage { get; set; } = new IsaacResourceImage();
        public List<FloorHistory> Floors { get; set; } = new List<FloorHistory>();
    }

    public class FloorHistory
    {
        public IsaacResourceImage FloorImage { get; set; } = new IsaacResourceImage();
        public List<EventHistory> Events { get; set; } = new List<EventHistory>();
    }

    public class EventHistory
    {
        public IsaacResourceImage Image { get; set; } = new IsaacResourceImage();
    }
}
