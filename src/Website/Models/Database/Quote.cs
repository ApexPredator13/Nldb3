using System;

namespace Website.Models.Database
{
    public class Quote
    {
        public int Id { get; set; }
        public int At { get; set; }
        public string QuoteText { get; set; } = string.Empty;
        public string Contributor { get; set; } = string.Empty;
        public DateTime SubmissionTime { get; set; }
        public string VideoId { get; set; } = string.Empty;
    }
}
