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
        [Display(Name = "Your public username")]
        public string UserName { get; set; } = String.Empty;

        [Required(ErrorMessage = "External login failed, please start over")]
        public string LoginProvider { get; set; } = String.Empty;
    }
}
