using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Models.Database
{
    public class DiscussionTopic
    {
        [Required]
        [JsonProperty("video_id")]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        [JsonProperty("topic")]
        [StringLength(100, MinimumLength = 5)]
        public string Topic { get; set; } = string.Empty;
    }
}
