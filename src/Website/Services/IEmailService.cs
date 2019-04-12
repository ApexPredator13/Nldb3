using System.Threading.Tasks;
using Website.Models.Account;

namespace Website.Services
{
    public interface IEmailService
    {
        string GenerateResetPasswordEmail(ForgotPasswordModel model, string callbackUrl);
        string GenerateConfirmEmailAddressEmail(string emailAddress, string callbackUrl);
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }
}
