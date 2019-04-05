using System;
using System.Collections.Generic;

namespace Website.Models.Isaac
{
    public class SubmittedEpisode
    {
        public int Id { get; set; }
        public Video Video { get; set; }
        public Guid Contributor { get; set; }
        public DateTime ContributedAt { get; set; }
        public List<GameplayEvent> EverythingThatHappened { get; set; }
        public List<SubmittedEpisodeFlag> Flags { get; set; }
    }
}
