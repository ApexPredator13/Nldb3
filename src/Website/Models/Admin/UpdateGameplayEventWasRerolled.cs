using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class UpdateGameplayEventWasRerolled
    {
        [Required]
        public int? EventId { get; set; }

        [Required]
        public bool? WasRerolled { get; set; }
    }
}
