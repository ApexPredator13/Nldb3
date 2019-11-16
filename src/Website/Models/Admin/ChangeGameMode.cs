using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Admin
{
    public class ChangeGameMode
    {
        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public GameMode NewGameMode { get; set; } = GameMode.Unspecified;
    }
}
