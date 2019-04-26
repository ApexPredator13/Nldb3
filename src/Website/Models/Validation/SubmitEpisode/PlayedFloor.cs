using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation.SubmitEpisode
{
    public class PlayedFloor
    {
        [Required]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        public string FloorId { get; set; } = string.Empty;

        [Required]
        public List<GameplayEvent> gameplayEvents = new List<GameplayEvent>();
    }
}
