using System.Collections.Generic;

namespace Website.Models.Database
{
    public class PlayedCharacter
    {
        public int Id { get; set; } = 0;
        public IsaacResource GameCharacter { get; set; } = new IsaacResource();
        public int Action { get; set; } = 0;
        public int RunNumber { get; set; } = 0;
        public IsaacResource? DiedFrom { get; set; } = null;
        public List<PlayedFloor> PlayedFloors { get; set; } = new List<PlayedFloor>();
        public int Submission { get; set; } = 0;
        public string? Seed { get; set; }
    }
}
