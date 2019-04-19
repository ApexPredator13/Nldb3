using System.ComponentModel.DataAnnotations;

namespace Website.Models.MyAccount
{
    public class ChangePasswordModel
    {
        [Required(ErrorMessage = "Please enter your old password")]
        [DataType(DataType.Password)]
        [Display(Name = "Your current password")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter your new password")]
        [DataType(DataType.Password)]
        [Display(Name = "Your new password")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "The password has to be at least 6 characters long")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter your new password a second time")]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm your new password")]
        [Compare("NewPassword", ErrorMessage = "The new passwords you entered do not match!")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "The password has to be at least 6 characters long")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}
