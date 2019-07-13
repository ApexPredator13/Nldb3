using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database.Enums;

namespace Website.Models
{
    public class IsaacSearchOptions
    {
        public bool Asc { get; set; } = false;
        public VideoOrderBy OrderBy { get; set; } = VideoOrderBy.Published;
        public string? Search { get; set; } = null;
        public int Page { get; set; } = 1;
        public int Amount { get; set; } = 50;
        public DateTime? From { get; set; } = null;
        public DateTime? Until { get; set; } = null;
        public string? ResourceId { get; set; } = null;
        public ResourceType ResourceType { get; set; } = ResourceType.Unspecified;
    }
}
