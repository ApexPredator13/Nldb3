using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Models
{
    public class IsaacResourceSearchOptions
    {
        public string Start { get; set; } = "Vanilla";
        public string End { get; set; } = "None";

        [Range(20, 500)]
        public int Amount { get; set; } = 100;
    }
}
