﻿using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class CreateTransformationItem
    {
        [Required]
        public string ItemId { get; set; } = string.Empty;

        [Required]
        public string TransformationId { get; set; } = string.Empty;

        [Required]
        public bool CanCountMultipleTimes { get; set; } = false;


        public string RequiresTitleContent { get; set; } = string.Empty;

        public DateTime? ValidFrom { get; set; } = null;

        public DateTime? ValidUntil { get; set; } = null;
    }
}
