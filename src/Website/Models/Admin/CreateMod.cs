using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Models.Admin
{
    public class CreateMod
    {
        public CreateMod() : this(string.Empty) { }

        public CreateMod(string modName)
        {
            ModName = modName;
        }

        [Required]
        [StringLength(256)]
        public string ModName { get; set; } = string.Empty;
    }
}
