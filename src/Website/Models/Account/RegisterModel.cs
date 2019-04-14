using System.ComponentModel.DataAnnotations;

namespace Website.Models.Account
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "Please pick a username")]
        [Display(Name = "Your public username")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "No e-mail address was provided")]
        [EmailAddress(ErrorMessage = "The e-mail address you entered seems to be invalid")]
        [Display(Name = "Your e-mail address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please pick a password")]
        [DataType(DataType.Password)]
        [Display(Name = "Your password")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "The password must be at least 6 characters long")]
        public string Password { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Compare(nameof(Password), ErrorMessage = "The two passwords do not match!")]
        [Display(Name = "Confirm your password")]
        public string PasswordConfirm { get; set; } = string.Empty;
    }
}
