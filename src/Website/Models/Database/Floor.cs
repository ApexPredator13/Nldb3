using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class Floor
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;
        public int X { get; set; } = 0;
        public int Y { get; set; } = 0;
        public int W { get; set; } = 0;
        public GameMode GameMode { get; set; } = GameMode.Unspecified;
        public string Color { get; set; } = string.Empty;
        public Mod? Mod { get; set; } = null;
        public int DisplayOrder { get; set; } = 0;
        public int Difficulty { get; set; } = 0;
    }
}
