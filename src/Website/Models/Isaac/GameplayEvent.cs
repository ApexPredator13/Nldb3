using System.Collections.Generic;
using Website.Models.Isaac.Enums;

namespace Website.Models.Isaac
{
    public class GameplayEvent
    {
        public int Id { get; set; }
        public GameplayEventType EventType { get; set; }
        public List<IsaacResource> Resources { get; set; }
    }
}
