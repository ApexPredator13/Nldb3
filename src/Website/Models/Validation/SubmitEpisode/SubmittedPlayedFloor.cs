using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation.SubmitEpisode
{
    public class SubmittedPlayedFloor
    {
        [Required]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        public string FloorId { get; set; } = string.Empty;

        [Required]
        public List<SubmittedGameplayEvent> gameplayEvents = new List<SubmittedGameplayEvent>();
    }
}
