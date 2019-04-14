using System.ComponentModel.DataAnnotations;

namespace Website.Models.MyAccount
{
    public class ChangeUsernameModel
    {
        [Required(ErrorMessage = "Please enter your new username")]
        public string NewUsername { get; set; } = string.Empty;
    }
}
