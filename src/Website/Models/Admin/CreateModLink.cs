using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class CreateModLink
    {
        [Required]
        public string Url { get; set; } = string.Empty;

        [Required]
        public string LinkText { get; set; } = string.Empty;

        [Required]
        public int? ModId { get; set; } = 0;
    }
}
