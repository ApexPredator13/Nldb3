using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

namespace Website.Models.Admin
{
    public class CreateIsaacResource
    {
        [Required]
        [StringLength(30)]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public ExistsIn ExistsIn { get; set; } = ExistsIn.Unspecified;

        [Required]
        public IFormFile? Icon { get; set; } = null;

        [Required]
        public GameMode GameMode { get; set; } = GameMode.Unspecified;

        [StringLength(25)]
        public string Color { get; set; } = "rgba(0,0,0,0.3)";

        [Required]
        public ResourceType ResourceType { get; set; } = ResourceType.Unspecified;

        public int? FromMod { get; set; } = null;

        public int? DisplayOrder { get; set; } = null;

        public int? Difficulty { get; set; } = null;

        public List<Effect>? Tags { get; set; } = null;
    }
}
