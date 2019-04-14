using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class SubmittedEpisodeFlag
    {
        public int Id { get; set; }

        [Required]
        public SubmittedEpisodeFlagReason Reason { get; set; }

        [Required]
        public IdentityUser FlaggedBy { get; set; }

        [Required]
        public DateTime FlagTime { get; set; }
    }
}
