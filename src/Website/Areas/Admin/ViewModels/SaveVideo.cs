using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class SaveVideo
    {
        [Required, StringLength(11, MinimumLength = 11)]
        public string VideoIds { get; set; } = string.Empty;
    }
}
