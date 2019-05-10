using System.Collections.Generic;

namespace Website.Models.Database
{
    public class PlayedFloor
    {
        public int Id { get; set; } = 0;
        public IsaacResource Floor { get; set; } = new IsaacResource();
        public int Action { get; set; } = 0;
        public int RunNumber { get; set; } = 0;
        public int FloorNumber { get; set; } = 0;
        public IsaacResource? DiedFrom { get; set; } = null;
        public List<GameplayEvent> GameplayEvents { get; set; } = new List<GameplayEvent>();
        public int Submission { get; set; }
        public int Duration { get; set; }
    }
}
