using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

#nullable disable
namespace Website.Models.Database
{
    public class Quote
    {
        public int Id { get; set; }

        [Required]
        public int SecondsIn { get; set; }

        [Required]
        public string QuoteText { get; set; }

        [Required]
        public IdentityUser Contributor { get; set; }

        public DateTime? SubmissionTime { get; set; }

        [Required]
        public NldbVideo Video { get; set; }
    }
}
