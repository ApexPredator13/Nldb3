using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Website.Models.Database
{
    public class NldbVideo
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("title")]
        public string Title { get; set; } = string.Empty;

        [JsonProperty("published")]
        public DateTime Published { get; set; }

        [JsonProperty("duration")]
        public TimeSpan? Duration { get; set; }

        [JsonProperty("thumbnails")]
        public List<NldbThumbnail> Thumbnails { get; set; } = new List<NldbThumbnail>();

        [JsonProperty("requires_update")]
        public bool RequiresUpdate { get; set; } = false;

        [JsonProperty("likes")]
        public int? Likes { get; set; } = null;

        [JsonProperty("dislikes")]
        public int? Dislikes { get; set; } = null;

        [JsonProperty("view_count")]
        public int? ViewCount { get; set; } = null;

        [JsonProperty("favorite_count")]
        public int? FavoriteCount { get; set; } = null;

        [JsonProperty("comment_count")]
        public int? CommentCount { get; set; } = null;

        [JsonProperty("submissions")]
        public List<SubmittedEpisode> Submissions { get; set; } = new List<SubmittedEpisode>();

        [JsonProperty("tags")]
        public List<string> Tags { get; set; } = new List<string>();

        [JsonProperty("is_3d")]
        public bool Is3D { get; set; } = false;

        [JsonProperty("is_hd")]
        public bool IsHD { get; set; } = false;

        [JsonProperty("cc")]
        public bool HasCaption { get; set; } = false;

        [JsonProperty("submission_count")]
        public int SubmissionCount { get; set; } = 0;

        [JsonProperty("ratio")]
        public decimal LikeDislikeRatio { get; set; } = 0.0m;
    }
}
