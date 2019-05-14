using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.SubmitEpisode
{
    public class SubmittedCompleteEpisode
    {
        [Required]
        [JsonProperty("video_id")]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        [JsonProperty("played_characters")]
        public List<SubmittedPlayedCharacter> PlayedCharacters { get; set; } = new List<SubmittedPlayedCharacter>();
    }
}
