using System.ComponentModel.DataAnnotations;

namespace Website.Models.SubmitEpisode
{
    public class SubmittedQuote
    {
        [Required, StringLength(11)]
        public string VideoId { get; set; } = string.Empty;

        [Required, StringLength(300), MinLength(10)]
        public string Content { get; set; } = string.Empty;

        [Required]
        public int At { get; set; } = 0;
    }
}
