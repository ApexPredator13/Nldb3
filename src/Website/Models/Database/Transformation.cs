using System;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class Transformation
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;
        public int X { get; set; } = 0;
        public int Y { get; set; } = 0;
        public int W { get; set; } = 0;
        public GameMode GameMode { get; set; } = GameMode.Unspecified;
        public string Color { get; set; } = "lightgray";
        public Mod? Mod { get; set; }
        public int ItemsNeeded { get; set; } = 3;
        public DateTime? ValidFrom = null;
        public DateTime? ValidUntil = null;
    }
}
