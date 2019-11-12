using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class SaveVideo
    {
        [Required, MinLength(11)]
        public string VideoIds { get; set; } = string.Empty;
    }
}
