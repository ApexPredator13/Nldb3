﻿using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class PlayedFloor
    {
        [Required]
        public string FloorId { get; set; } = string.Empty;

        public string DeathId { get; set; } = string.Empty;

        [Required]
        public List<GameplayEvent> gameplayEvents = new List<GameplayEvent>();
    }
}