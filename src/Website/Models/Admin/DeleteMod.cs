using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Models.Admin
{
    public class DeleteMod
    {
        [Required]
        public int ModId { get; set; }
    }
}
