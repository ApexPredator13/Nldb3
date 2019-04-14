using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

#nullable disable
namespace Website.Models.Database
{
    public class Video
    {
        public string Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public DateTime Published { get; set; }

        [Required]
        public TimeSpan Duration { get; set; }

        public List<Thumbnail> Thumbnails { get; set; }
        public bool RequiresUpdate { get; set; } = false;
        public int? Likes { get; set; }
        public int? Dislikes { get; set; }
        public int? ViewCount { get; set; }
        public int? FavouriteCount { get; set; }
        public int? CommentCount { get; set; }
        public List<SubmittedEpisode> Submissions { get; set; }
    }
}
