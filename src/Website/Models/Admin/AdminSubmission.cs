using Newtonsoft.Json;
using System;
using Website.Models.Database.Enums;

namespace Website.Models.Admin
{
    public class AdminSubmission
    {
        [JsonProperty("submission_id")]
        public int SubmissionId { get; set; }

        [JsonProperty("video_title")]
        public string? VideoTitle { get; set; }

        [JsonProperty("submission_type")]
        public SubmissionType SubmissionType { get; set; } = SubmissionType.Old;

        [JsonProperty("latest")]
        public bool? Latest { get; set; }

        [JsonProperty("user_name")]
        public string? UserName { get; set; }

        [JsonProperty("video_id")]
        public string VideoId { get; set; } = string.Empty;

        [JsonProperty("video_release_date")]
        public DateTime VideoReleaseDate { get; set; } = DateTime.Now;
    }
}


