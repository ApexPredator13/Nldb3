using System.Collections.Generic;
using System.Linq;
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
