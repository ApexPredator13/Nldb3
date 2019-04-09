using System.Threading.Tasks;
using Website.Models.Account;

namespace Website.Services
{
    public interface IEmailService
    {
        string GenerateResetPasswordEmail(ForgotPasswordModel model, string callbackUrl, string code);
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }
}
