using System;
using Website.Models.Isaac.Enums;

namespace Website.Models.Isaac
{
    public class QuoteFlag
    {
        public int Id { get; set; }
        public Guid Flagger { get; set; }
        public DateTime FlagTime { get; set; }
        public QuoteFlagReason FlagReason { get; set; }
        public Quote Quote { get; set; }
    }
}
