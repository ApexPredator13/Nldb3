using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class IsaacResourceTag
    {
        public int Id { get; set; }

        [Required]
        public Effects Effect { get; set; }
    }
}
