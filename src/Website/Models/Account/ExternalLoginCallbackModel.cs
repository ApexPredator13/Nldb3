using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Models.Account
{
    public class ExternalLoginCallbackModel
    {
        public ExternalLoginCallbackModel()
        {
            UserName = String.Empty;
            LoginProvider = String.Empty;
        }

        public ExternalLoginCallbackModel(string loginProvider)
        {
            UserName = String.Empty;
            LoginProvider = loginProvider;
        }

        [Required(ErrorMessage = "Please choose a username")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Username must be between 2 and 50 characters long")]
        [RegularExpression(@"^[^<>""'\r\n\t]+$", ErrorMessage = "Username contains invalid characters")]
        [Display(Name = "Your public username")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "External login failed, please start over")]
        public string LoginProvider { get; set; }
    }
}
