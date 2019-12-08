using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class DeleteSubmission
    {
        [Required]
        public int SubmissionId { get; set; }
    }
}
