using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Admin
{
    public class ChangeExistsIn
    {
        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public ExistsIn NewExistsIn { get; set; } = ExistsIn.Unspecified;
    }
}
