using System.ComponentModel.DataAnnotations;
using Website.Models.SubmitEpisode;

namespace Website.Models.Admin
{
    public class InsertGameplayEvent
    {
        [Required]
        public SubmittedGameplayEvent NewEvent { get; set; } = new SubmittedGameplayEvent();

        [Required]
        public int InsertAfterEvent { get; set; }

        [Required]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        public int PlayedCharacterId { get; set; }

        [Required]
        public int PlayedFloorId { get; set; }

        [Required]
        public int RunNumber { get; set; }

        [Required]
        public int FloorNumber { get; set; }

        public int? InConsequenceOf { get; set; }
    }
}


