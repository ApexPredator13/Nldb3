﻿using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Validation
{
    public class GameplayEvent
    {
        [Required]
        public GameplayEventType EventType { get; set; }

        [Required]
        public string RelatedResource1 { get; set; }

        public string RelatedResource2 { get; set; }

        public int SomeAmount { get; set; }
    }
}