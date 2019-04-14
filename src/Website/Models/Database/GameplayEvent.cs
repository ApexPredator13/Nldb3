using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class GameplayEvent
    {
        public int Id { get; set; }

        [Required]
        public GameplayEventType EventType { get; set; }

        [Required]
        public List<IsaacResource> Resources { get; set; }
    }
}
