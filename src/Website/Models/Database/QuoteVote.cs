using System;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class QuoteVote
    {
        public int Id { get; set; } = 0;
        public Vote Vote { get; set; } = Vote.Up;
        public string UserName { get; set; } = string.Empty;
        public int Quote { get; set; } = 0;
        public DateTime VoteTime { get; set; } = DateTime.Now;
    }
}
