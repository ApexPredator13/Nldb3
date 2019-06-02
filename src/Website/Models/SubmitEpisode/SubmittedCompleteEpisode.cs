using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.SubmitEpisode
{
    public class SubmittedCompleteEpisode
    {
        [Required]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        public List<SubmittedPlayedCharacter> PlayedCharacters { get; set; } = new List<SubmittedPlayedCharacter>();
    }
}
