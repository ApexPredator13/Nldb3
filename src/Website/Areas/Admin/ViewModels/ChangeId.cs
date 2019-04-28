﻿using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class ChangeId
    {
        [Required]
        [StringLength(30)]
        public string CurrentId { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string NewId { get; set; } = string.Empty;
    }
}
