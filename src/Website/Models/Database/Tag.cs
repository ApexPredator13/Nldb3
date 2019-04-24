using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class Tag
    {
        public int Id { get; set; }

        [Required]
        public Effect Effect { get; set; }
    }
}
