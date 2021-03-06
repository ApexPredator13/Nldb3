﻿using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class ChangeIcon
    {
        [Required, StringLength(30)]
        public string ResourceId { get; set; } = string.Empty;

        [Required]
        public IFormFile? NewIcon { get; set; } = null;
    }
}
