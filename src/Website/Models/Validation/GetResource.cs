using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Validation
{
    public class GetResource
    {
        [Required]
        public ResourceType ResourceType { get; set; } = ResourceType.Unspecified;
        public bool IncludeMod { get; set; } = false;
        public ResourceOrderBy OrderBy1 { get; set; } = ResourceOrderBy.DisplayOrder;
        public ResourceOrderBy OrderBy2 { get; set; } = ResourceOrderBy.Id;
        public bool Asc { get; set; } = true;
        public List<Effect> RequiredTags { get; set; } = new List<Effect>();
    }
}
