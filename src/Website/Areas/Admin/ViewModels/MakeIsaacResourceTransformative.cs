using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class MakeIsaacResourceTransformative
    {
        [Required, StringLength(30)]
        public string ResourceId { get; set; } = string.Empty;

        [Required, StringLength(30)]
        public string TransformationId { get; set; } = string.Empty;

        [Required]
        public bool CanCountMultipleTimes { get; set; } = false;

        [Required]
        public int StepsNeeded { get; set; } = 3;

        public string? RequiresTitleContent { get; set; } = string.Empty;

        public DateTime? ValidFrom { get; set; } = null;

        public DateTime? ValidUntil { get; set; } = null;
    }
}
