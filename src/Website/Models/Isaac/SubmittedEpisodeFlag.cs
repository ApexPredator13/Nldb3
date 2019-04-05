using System;
using Website.Models.Isaac.Enums;

namespace Website.Models.Isaac
{
    public class SubmittedEpisodeFlag
    {
        public int Id { get; set; }
        public SubmittedEpisodeFlagReason Reason { get; set; }
        public Guid FlaggedBy { get; set; }
        public DateTime FlagTime { get; set; }
    }
}
