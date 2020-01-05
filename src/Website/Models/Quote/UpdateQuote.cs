using System.ComponentModel.DataAnnotations;

namespace Website.Models.Quote
{
    public class UpdateQuote
    {
        [Required]
        public int? Id { get; set; }

        [Required]
        public int? At { get; set; }

        [Required]
        [StringLength(300, MinimumLength = 10)]
        public string QuoteText { get; set; } = string.Empty;
    }
}

