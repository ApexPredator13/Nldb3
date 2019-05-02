using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation.SubmitEpisode
{
    public class SubmittedPlayedCharacter
    {
        [Required]
        public string CharacterId { get; set; } = string.Empty;

        [Required]
        public List<SubmittedPlayedFloor> PlayedFloors { get; set; } = new List<SubmittedPlayedFloor>();
    }
}
