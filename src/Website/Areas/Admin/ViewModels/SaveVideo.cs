using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class SaveVideo
    {
        [Required, MinLength(11)]
        public string VideoIds { get; set; } = string.Empty;
    }
}
