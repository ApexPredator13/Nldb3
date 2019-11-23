using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database.Enums;

namespace Website.Models.Admin
{
    public class ChangeTags
    {
        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public IEnumerable<Effect> Tags { get; set; } = new List<Effect>();
    }
}
