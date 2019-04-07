using System.ComponentModel.DataAnnotations;

namespace Website.Models.Account
{
    public class LoginModel
    {
        public LoginModel()
        {
            EmailOrUsername = string.Empty;
            Password = string.Empty;
            RememberMe = false;
        }

        [Required]
        [Display(Name = "Your Email or Username")]
        public string EmailOrUsername { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Your Password")]
        public string Password { get; set; }

        [Display(Name = "Stay logged in?")]
        public bool RememberMe { get; set; }
    }
}
