using Website.Models.Database;

namespace Website.Models.Admin
{
    public class SubmissionDifference
    {
        public SubmissionDifference(GameplayEvent? onlyExistsInOriginalSubmission, GameplayEvent? onlyExistsInNewSubmission, string message)
        {
            OnlyExistsInOriginalSubmission = onlyExistsInOriginalSubmission;
            OnlyExistsInNewSubmission = onlyExistsInNewSubmission;
            Message = message;
        }

        public GameplayEvent? OnlyExistsInOriginalSubmission { get; set; }
        public GameplayEvent? OnlyExistsInNewSubmission { get; set; }
        public string Message { get; set; }
    }
}
