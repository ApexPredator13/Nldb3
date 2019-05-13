using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.SubmitEpisode
{
    public class SubmittedQuoteVote
    {
        [Required]
        public Vote Vote { get; set; } = Vote.Up;

        [Required]
        public int QuoteId { get; set; } = 0;
    }
}
