using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Admin
{
    public class ChangeTags
    {
        [Required]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public IEnumerable<Tag> Tags { get; set; } = new List<Tag>();
    }
}
