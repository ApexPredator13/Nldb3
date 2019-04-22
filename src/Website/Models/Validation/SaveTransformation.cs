using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class SaveTransformation : SaveIsaacResource
    {
        [Required]
        public int StepsNeeded { get; set; } = 0;
    }
}
