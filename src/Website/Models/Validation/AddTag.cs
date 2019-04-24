using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Validation
{
    public class AddTag
    {
        [StringLength(30)]
        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public Effect Effect { get; set; } = Effect.Unspecified;
    }
}
