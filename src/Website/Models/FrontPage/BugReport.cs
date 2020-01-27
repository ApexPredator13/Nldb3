using System.ComponentModel.DataAnnotations;

namespace Website.Models.FrontPage
{
    public class BugReport
    {
        [Required, StringLength(500)]
        public string Text { get; set; } = string.Empty;
    }
}

