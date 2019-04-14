using System.ComponentModel.DataAnnotations;

namespace Website.Models.MyAccount
{
    public class AddNormalLoginModel
    {
        [Required(ErrorMessage = "Please provide an e-mail address")]
        [EmailAddress(ErrorMessage = "The e-mail address you entered is invalid")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter a password")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "The password must be at least 6 characters long")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please confirm your new password")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "The two passwords don't match!")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
