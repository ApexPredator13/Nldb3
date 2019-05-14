using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.SubmitEpisode
{
    public class SubmittedPlayedCharacter
    {
        [Required]
        public string CharacterId { get; set; } = string.Empty;

        [Required]
        public GameMode GameMode { get; set; }

        [Required]
        public List<SubmittedPlayedFloor> PlayedFloors { get; set; } = new List<SubmittedPlayedFloor>();
    }
}
