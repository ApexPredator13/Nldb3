using System;
using Website.Models.Isaac.Enums;

namespace Website.Models.Isaac
{
    public class QuoteVote
    {
        public int Id { get; set; }
        public Vote Vote { get; set; }
        public Guid Voter { get; set; }
        public Quote Quote { get; set; }
        public DateTime VoteTime { get; set; }
    }
}
