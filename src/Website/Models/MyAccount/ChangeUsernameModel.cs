using System.ComponentModel.DataAnnotations;

namespace Website.Models.MyAccount
{
    public class ChangeUsernameModel
    {
        [Required(ErrorMessage = "Please enter your new username")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Username must be between 2 and 50 characters long")]
        [RegularExpression(@"^[^<>""'\r\n\t]+$", ErrorMessage = "Username contains invalid characters")]
        [Display(Name = "New Username")]
        public string NewUsername { get; set; } = string.Empty;
    }
}
