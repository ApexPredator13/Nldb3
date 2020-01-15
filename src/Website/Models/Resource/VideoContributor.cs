using Newtonsoft.Json;

namespace Website.Models.Resource
{
    public class VideoContributor
    {
        public VideoContributor(int submissionId, string? userName)
        {
            SubmissionId = submissionId;
            UserName = userName ?? "[Unknown User]";
        }

        [JsonProperty("submission_id")]
        public int SubmissionId { get; set; }

        [JsonProperty("user_name")]
        public string UserName { get; set; } = string.Empty;
    }
}
