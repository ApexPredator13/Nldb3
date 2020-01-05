using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Database
{
    public class DiscussionTopic
    {
        [Required]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 5)]
        public string Topic { get; set; } = string.Empty;
    }
}
