using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Account;
using Website.Services;

namespace Website.Infrastructure
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        private void OpenBodyTag(StringBuilder s) => s.Append("<html><body>");
        private void CloseBodyTag(StringBuilder s) => s.Append("</html></body>");
        private void AppendEmailHeader(StringBuilder s) => s.Append("<h1>Greetings from the Northernlion Database!</h1>");
        private void AppendEmailFooter(StringBuilder s) => s.Append("<p>If you encounter any problems, you can answer directly to this e-mail and I will get back to you as soon as I can.<br/>Have a nice day!</p>");

        public string GenerateChangeEmailAddressEmail(string emailAddress, string callbackUrl)
        {
            var s = new StringBuilder();
            OpenBodyTag(s);
            AppendEmailHeader(s);
            s.Append("<p>We received a request that you would like to change your e-mail address.</p>");
            s.Append($"<p>Please <a target=\"_blank\" href=\"{callbackUrl}\">Click this link</a> to complete the process!</p>");
            AppendEmailFooter(s);
            CloseBodyTag(s);
            return s.ToString();
        }

        public string GenerateConfirmEmailAddressEmail(string emailAddress, string callbackUrl)
        {
            var s = new StringBuilder();
            OpenBodyTag(s);
            AppendEmailHeader(s);
            s.Append($"<p>Please <a target=\"_blank\" href=\"{callbackUrl}\">Click this link</a> to confirm your e-mail address.</p>");
            AppendEmailFooter(s);
            CloseBodyTag(s);
            return s.ToString();
        }

        public string GenerateResetPasswordEmail(string emailAddress, string callbackUrl)
        {
            var s = new StringBuilder();
            OpenBodyTag(s);
            AppendEmailHeader(s);
            s.Append("<p>We received a password reset request for this e-mail address.</p>");
            s.Append($"<p>Please <a target=\"_blank\" href=\"{callbackUrl}\">Click this link</a> to create a new password.</p>");
            AppendEmailFooter(s);
            CloseBodyTag(s);
            return s.ToString();
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            MimeMessage mail = new MimeMessage();

            mail.From.Add(new MailboxAddress("The Northernlion Database", "northernliondb@gmail.com"));
            mail.To.Add(new MailboxAddress(string.Empty, email));
            mail.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlMessage
            };

            mail.Body = builder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                client.LocalDomain = "www.northernlion-db.com";

                await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTlsWhenAvailable);
                client.AuthenticationMechanisms.Remove("XOAUTH2");

                await client.AuthenticateAsync("northernliondb@gmail.com", _config["AdminEmailPassword"]);
                await client.SendAsync(mail);

                await client.DisconnectAsync(true);
            }
        }
    }
}
