using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class EmailTest
    {
        [Required]
        public string To { get; set; } = string.Empty;

        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string HtmlMessage { get; set; } = string.Empty;
    }
}

