using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class SaveTransformation : SaveIsaacResource
    {
        [Required]
        public int ItemsNeeded { get; set; } = 0;
    }
}
