using System.ComponentModel.DataAnnotations;
using Website.Models.Database;

namespace Website.Areas.Admin.ViewModels
{
    public class ChangeColor
    {
        public ChangeColor(IsaacResource resource) : this(resource.Id, resource.Color) { }

        public ChangeColor(string resourceId) : this(resourceId, "rgba(0,0,0,0.3)") { }

        public ChangeColor(string resourceId, string color)
        {
            ResourceId = resourceId;
            Color = color;
        }

        public ChangeColor() : this(string.Empty) { }

        [Required]
        public string ResourceId { get; set; }

        [Required]
        public string Color { get; set; }
    }
}
