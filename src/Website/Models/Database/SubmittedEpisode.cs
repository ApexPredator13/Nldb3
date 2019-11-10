using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class SubmittedEpisode
    {
        [JsonProperty("id")]
        public int Id { get; set; } = 0;

        [JsonProperty("video_id")]
        public string Video { get; set; } = string.Empty;

        [JsonProperty("submission_type")]
        public SubmissionType SubmissionType { get; set; } = SubmissionType.New;

        [JsonProperty("latest")]
        public bool Latest { get; set; } = false;

        [JsonProperty("played_characters")]
        public List<PlayedCharacter> PlayedCharacters { get; set; } = new List<PlayedCharacter>();

        [JsonProperty("username")]
        public string UserName { get; set; } = string.Empty;
        
        [JsonProperty("is_two_player")]
        public bool IsTwoPlayerMode
        {
            get {
                if (PlayedCharacters is null || PlayedCharacters.Count is 0)
                {
                    return false;
                }
                if (PlayedCharacters.Any(x => x.GameCharacter.Name == "Jacob & Esau"))
                {
                    return true;
                }
                foreach (var c in PlayedCharacters)
                {
                    foreach (var f in c.PlayedFloors)
                    {
                        foreach (var e in f.GameplayEvents)
                        {
                            if (e.Player != null && e.Player == 2)
                            {
                                return true;
                            }
                        }
                    }
                }

                return false;
            }
        }
    }
}
