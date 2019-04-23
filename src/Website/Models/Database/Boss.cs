using System.Collections.Generic;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class Boss
    {
        public string Id { get; set; } = string.Empty;
        public bool DoubleTrouble { get; set; } = false;
        public string Name { get; set; } = string.Empty;
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;
        public int X { get; set; } = 0;
        public int Y { get; set; } = 0;
        public int W { get; set; } = 0;
        public GameMode GameMode { get; set; } = GameMode.Unspecified;
        public string Color { get; set; } = string.Empty;
        public Mod? Mod { get; set; } = null;
        public List<BossTag> BossTags { get; set; } = new List<BossTag>();
    }
}
