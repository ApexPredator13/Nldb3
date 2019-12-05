using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class DeleteGameplayEvent
    {
        [Required]
        public int GameplayEventId { get; set; }
    }
}
