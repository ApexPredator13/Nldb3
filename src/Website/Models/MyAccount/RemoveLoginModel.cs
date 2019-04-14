using System.ComponentModel.DataAnnotations;

namespace Website.Models.MyAccount
{
    public class RemoveLoginModel
    {
        [Required(ErrorMessage = "The external login could not be removed")]
        public string ProviderKey { get; set; } = string.Empty;

        [Required(ErrorMessage = "The external login could not be removed")]
        public string LoginProvider { get; set; } = string.Empty;
    }
}
