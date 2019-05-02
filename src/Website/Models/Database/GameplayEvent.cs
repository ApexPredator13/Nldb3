using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class GameplayEvent
    {
        public int Id { get; set; } = 0;
        public GameplayEventType EventType { get; set; } = GameplayEventType.Unspecified;
        public IsaacResource Resource1 { get; set; } = new IsaacResource();
        public IsaacResource? Resource2 { get; set; } = null;
        public int? Resource3 { get; set; } = null;
        public int Action { get; set; } = 0;
        public IsaacResource? InConsequenceOf { get; set; } = null;
        public int RunNumber { get; set; } = 0;
        public int? Player { get; set; } = null;
        public int FloorNumber { get; set; } = 0;
        public int Submission { get; set; } = 0;
    }
}
