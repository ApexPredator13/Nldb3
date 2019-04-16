using System.ComponentModel.DataAnnotations;

namespace Website.Models.Account
{
    public class LoginModel
    {
        [Required(ErrorMessage = "Please enter your username or e-mail address")]
        [Display(Name = "Your Email or Username")]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter your password")]
        [DataType(DataType.Password)]
        [Display(Name = "Your Password")]
        public string Password { get; set; } = string.Empty;

        [Display(Name = "Stay logged in?")]
        public bool RememberMe { get; set; } = false;
    }
}
