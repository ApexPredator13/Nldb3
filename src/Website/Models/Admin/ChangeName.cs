using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class ChangeName
    {
        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string NewName { get; set; } = string.Empty;
    }
}
