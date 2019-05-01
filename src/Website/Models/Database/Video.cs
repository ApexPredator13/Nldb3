using System;
using System.Collections.Generic;
using Website.Models.Validation.SubmitEpisode;

namespace Website.Models.Database
{
    public class Video
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime Published { get; set; }
        public TimeSpan? Duration { get; set; }
        public List<Thumbnail> Thumbnails { get; set; } = new List<Thumbnail>();
        public bool RequiresUpdate { get; set; } = false;
        public int? Likes { get; set; } = null;
        public int? Dislikes { get; set; } = null;
        public int? ViewCount { get; set; } = null;
        public int? FavouriteCount { get; set; } = null;
        public int? CommentCount { get; set; } = null;
        public List<SubmittedEpisode> Submissions { get; set; } = new List<SubmittedEpisode>();
        public List<string> Tags { get; set; } = new List<string>();
        public bool Is3D { get; set; } = false;
        public bool IsHD { get; set; } = false;
        public bool HasCaption { get; set; } = false;
    }
}
