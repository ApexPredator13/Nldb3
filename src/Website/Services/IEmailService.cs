using System.Threading.Tasks;
using Website.Models.Account;

namespace Website.Services
{
    public interface IEmailService
    {
        string GenerateResetPasswordEmail(string emailAddress, string callbackUrl);
        string GenerateConfirmEmailAddressEmail(string emailAddress, string callbackUrl);
        string GenerateChangeEmailAddressEmail(string emailAddress, string callbackUrl);
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }
}
