using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Validation
{
    public class SaveIsaacResource
    {
        [Required]
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
        public GameMode GameMode { get; set; } = GameMode.Unspecified;

        public string Color { get; set; } = "rgba(0,0,0,0.3)";
        public int? FromMod { get; set; } = null;
    }
}
