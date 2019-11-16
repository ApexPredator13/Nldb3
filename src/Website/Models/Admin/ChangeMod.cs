using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class ChangeMod
    {
        public ChangeMod() : this(string.Empty, null) { }

        public ChangeMod(string resourceId, int? modId)
        {
            ResourceId = resourceId;
            ModId = modId;
        }

        [Required]
        public string ResourceId { get; set; }
        public int? ModId { get; set; }
    }
}


