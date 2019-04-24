using System.Collections.Generic;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class IsaacResource
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ResourceType ResourceType { get; set; } = ResourceType.Unspecified;
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;
        public int X { get; set; } = 0;
        public int Y { get; set; } = 0;
        public int W { get; set; } = 0;
        public int H { get; set; } = 0;
        public GameMode GameMode { get; set; } = GameMode.Unspecified;
        public string Color { get; set; } = string.Empty;
        public Mod? Mod { get; set; } = null;
        public List<Tag> Tags { get; set; } = new List<Tag>();
        public int? DisplayOrder { get; set; } = null;
        public int? Difficulty { get; set; } = null;
    }
}


