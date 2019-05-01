using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class SaveVideo
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime Published { get; set; } = DateTime.Now;

        [Required]
        public int Duration { get; set; } = 0;

        [Required]
        public bool Latest { get; set; } = true;
    }
}
