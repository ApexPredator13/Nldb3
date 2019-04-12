using System.ComponentModel.DataAnnotations;

namespace Website.Models.MyAccount
{
    public class DeleteAccountInputModel
    {
        [DataType(DataType.Password)]
        [Display(Name = "Please enter your password to proceed")]
        public string? Password { get; set; }

        [Display(Name = "Please enter your username or e-mail address to proceed")]
        public string? UserNameOrEmail { get; set; }
    }
}
