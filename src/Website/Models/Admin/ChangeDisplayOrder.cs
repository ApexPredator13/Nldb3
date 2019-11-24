using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Models.Admin
{
    public class ChangeDisplayOrder
    {
        [Required]
        public string ResourceId { get; set; } = string.Empty;

        public int? DisplayOrder { get; set; } = null;
    }
}
