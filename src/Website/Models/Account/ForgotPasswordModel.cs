using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Account
{
    public class ForgotPasswordModel
    {
        [Required(ErrorMessage = "No e-mail address was provided")]
        [EmailAddress(ErrorMessage = "The provided e-mail address is invalid")]
        public string? Email { get; set; } = String.Empty;
    }
}
