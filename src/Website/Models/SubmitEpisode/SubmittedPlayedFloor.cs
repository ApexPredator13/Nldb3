using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.SubmitEpisode
{
    public class SubmittedPlayedFloor
    {
        [Required]
        public string FloorId { get; set; } = string.Empty;

        [Required]
        public List<SubmittedGameplayEvent> GameplayEvents = new List<SubmittedGameplayEvent>();

        public int? Duration { get; set; } = null;
    }
}
