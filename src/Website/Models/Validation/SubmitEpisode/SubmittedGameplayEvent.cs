using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Validation.SubmitEpisode
{
    public class SubmittedGameplayEvent
    {
        [Required]
        public GameplayEventType EventType { get; set; } = GameplayEventType.Unspecified;

        [Required]
        public string RelatedResource1 { get; set; } = string.Empty;

        public string? RelatedResource2 { get; set; } = null;

        public int? RelatedResource3 { get; set; } = null;

        public int? Player { get; set; } = null;
    }
}