using System.ComponentModel.DataAnnotations;

namespace Website.Models.MyAccount
{
    public class ChangeEmailModel
    {
        [Required(ErrorMessage = "Please enter the new e-mail address you want to use")]
        [EmailAddress(ErrorMessage = "The e-mail address you entered is invalid")]
        public string Email { get; set; } = string.Empty;
    }
}
