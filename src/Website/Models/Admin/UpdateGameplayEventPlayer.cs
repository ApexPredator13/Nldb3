using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Models.Admin
{
    public class UpdateGameplayEventPlayer
    {
        [Required]
        public int EventId { get; set; }

        [Range(1, 2)]
        public int? Player { get; set; }
    }
}
