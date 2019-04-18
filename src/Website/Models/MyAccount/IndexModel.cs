using Microsoft.AspNetCore.Identity;

namespace Website.Models.MyAccount
{
    public class IndexModel
    {
        public IdentityUser User { get; set; } = new IdentityUser();
        public bool HasEmail { get; set; } = false;
        public bool HasPassword { get; set; } = false;
        public bool EmailIsConfirmed { get; set; } = false;
    }
}
