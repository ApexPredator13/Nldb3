using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation.SubmitEpisode
{
    public class PlayedCharacter
    {
        [Required]
        public string CharacterId { get; set; } = string.Empty;

        [Required]
        public List<PlayedFloor> PlayedFloors { get; set; } = new List<PlayedFloor>();
    }
}
