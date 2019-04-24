using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Validation
{
    public class SaveIsaacResource
    {
        [Required]
        [StringLength(30)]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;

        [Required]
        public int X { get; set; } = 0;

        [Required]
        public int Y { get; set; } = 0;

        [Required]
        public int W { get; set; } = 0;

        [Required]
        public int H { get; set; } = 0;

        [Required]
        public GameMode GameMode { get; set; } = GameMode.Unspecified;

        [StringLength(25)]
        public string Color { get; set; } = "rgba(0,0,0,0.3)";

        public int? FromMod { get; set; } = null;

        public ResourceType ResourceType { get; set; } = ResourceType.Unspecified;

        public int? DisplayOrder { get; set; } = null;

        public int? Difficulty { get; set; } = null;
    }
}
