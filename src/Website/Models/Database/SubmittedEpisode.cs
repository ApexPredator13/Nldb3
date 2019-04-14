using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

#nullable disable
namespace Website.Models.Database
{
    public class SubmittedEpisode
    {
        public int Id { get; set; }

        [Required]
        public Video Video { get; set; }

        [Required]
        public IdentityUser Contributor { get; set; }

        [Required]
        public DateTime ContributedAt { get; set; }

        public List<GameplayEvent> EverythingThatHappened { get; set; }
        public List<SubmittedEpisodeFlag> Flags { get; set; }
    }
}
