using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class DeleteMod
    {
        [Required]
        public int ModId { get; set; }
    }
}
