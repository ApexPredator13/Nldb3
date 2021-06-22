using System;

namespace Website.Models.Database
{
    public class TransformativeIsaacResource : IsaacResource
    {
        public bool CountsMultipleTimes { get; set; }

        public string? RequiresTitleContent { get; set; }

        public DateTime? ValidFrom { get; set; }

        public DateTime? ValidUntil { get; set; }

        public int StepsNeeded { get; set; }
    }
}
