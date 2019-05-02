using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class SaveVideo
    {
        [Required, StringLength(11)]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime Published { get; set; } = DateTime.Now;

        [Required]
        public int Duration { get; set; } = 0;

        [Required]
        public bool NeedsUpdate { get; set; } = false;

        [Required]
        public int? Likes { get; set; } = null;

        [Required]
        public int? Dislikes { get; set; } = null;

        [Required]
        public int? FavouriteCount { get; set; } = null;

        [Required]
        public int? CommentCount { get; set; } = null;

        [Required]
        public int? ViewCount { get; set; } = null;

        [Required]
        public List<string> Tags { get; set; } = new List<string>();

        [Required]
        public bool Is3D { get; set; } = false;

        [Required]
        public bool IsHD { get; set; } = false;

        [Required]
        public bool HasCaption { get; set; } = false;
    }
}
