using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Models.Isaac
{
    public class Quote
    {
        public int Id { get; set; }
        public int SecondsIn { get; set; }
        public string QuoteText { get; set; }
        public Guid Contributor { get; set; }
        public DateTime SubmissionTime { get; set; }
        public Video Video { get; set; }
    }
}
