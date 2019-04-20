using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class SaveBoss : SaveIsaacResource
    {
        [Required]
        public bool DoubleTrouble { get; set; } = false;
    }
}
