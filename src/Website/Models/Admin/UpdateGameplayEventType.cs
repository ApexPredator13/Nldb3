using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database.Enums;

namespace Website.Models.Admin
{
    public class UpdateGameplayEventType
    {
        [Required]
        public int GameplayEventId { get; set; }

        [Required]
        public GameplayEventType NewGameplayEventType { get; set; }
    }
}
