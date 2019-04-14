using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class QuoteFlag
    {
        public int Id { get; set; }

        [Required]
        public IdentityUser Flagger { get; set; }

        [Required]
        public DateTime FlagTime { get; set; }

        [Required]
        public QuoteFlagReason FlagReason { get; set; }

        [Required]
        public Quote Quote { get; set; }
    }
}
