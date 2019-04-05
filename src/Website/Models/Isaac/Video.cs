using System;
using System.Collections.Generic;

namespace Website.Models.Isaac
{
    public class Video
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public List<Thumbnail> Thumbnails { get; set; }
        public bool RequiresUpdate { get; set; }
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public int ViewCount { get; set; }
        public int FavouriteCount { get; set; }
        public int CommentCount { get; set; }
        public DateTime Published { get; set; }
        public TimeSpan Duration { get; set; }
        public List<SubmittedEpisode> Submissions { get; set; }
    }
}
