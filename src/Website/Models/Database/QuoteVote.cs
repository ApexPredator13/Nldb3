using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class QuoteVote
    {
        public int Id { get; set; }

        [Required]
        public Vote Vote { get; set; }

        [Required]
        public IdentityUser Voter { get; set; }

        [Required]
        public Quote Quote { get; set; }

        [Required]
        public DateTime VoteTime { get; set; }
    }
}
