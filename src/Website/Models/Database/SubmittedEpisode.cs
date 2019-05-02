using System.Collections.Generic;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class SubmittedEpisode
    {
        public int Id { get; set; } = 0;
        public string Video { get; set; } = string.Empty;
        public SubmissionType SubmissionType { get; set; } = SubmissionType.New;
        public bool Latest { get; set; } = false;
        public List<PlayedCharacter> PlayedCharacters { get; set; } = new List<PlayedCharacter>();
        public string UserName { get; set; } = string.Empty;
    }
}
