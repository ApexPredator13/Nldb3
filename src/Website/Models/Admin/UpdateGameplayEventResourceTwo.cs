using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class UpdateGameplayEventResourceTwo
    {
        [Required]
        public int? EventId { get; set; }

        [Required]
        public string? NewResourceTwo { get; set; }
    }
}
