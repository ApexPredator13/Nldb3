using System.ComponentModel.DataAnnotations;

namespace Website.Models.Account
{
    public class ResetPasswordModel
    {
        [Required(ErrorMessage = "Please provide your email or username")]
        [Display(Name = "Your e-mail or username")]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required(ErrorMessage = "No password was provided")]
        [DataType(DataType.Password)]
        [Display(Name = "Your new password")]
        [StringLength(100, ErrorMessage = "The password can not be longer than 100 characters")]
        public string Password { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Display(Name = "Confirm the new Password")]
        [Compare(nameof(Password), ErrorMessage = "The passwords you entered do not match!")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;
    }
}
