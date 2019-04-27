using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class DeleteModLink
    {
        [Required]
        public int LinkId { get; set; }

        [Required]
        public int ModId { get; set; }
    }
}
