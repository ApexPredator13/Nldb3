﻿using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database;

namespace Website.Models.Validation
{
    public class SubmittedEpisode
    {
        public int Id { get; set; } = 0;

        [Required]
        public string VideoId { get; set; } = string.Empty;

        [Required]
        public List<PlayedCharacter> PlayedCharacters { get; set; } = new List<PlayedCharacter>();
    }
}