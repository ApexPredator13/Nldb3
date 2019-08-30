using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class ChangeMod
    {
        public ChangeMod() : this(string.Empty, null, null) { }

        public ChangeMod(string resourceId, string? currentMod, int? modId)
        {
            ResourceId = resourceId;
            ModId = modId;
            CurrentMod = currentMod;
        }

        [Required]
        public string ResourceId { get; set; }
        public int? ModId { get; set; }
        public string? CurrentMod { get; set; }
    }
}


