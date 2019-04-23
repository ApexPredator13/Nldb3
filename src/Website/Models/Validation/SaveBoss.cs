using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class SaveBossModel : SaveIsaacResource
    {
        [Required]
        public bool DoubleTrouble { get; set; } = false;
    }
}
