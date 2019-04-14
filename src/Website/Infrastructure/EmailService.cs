using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
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

        public string GenerateChangeEmailAddressEmail(string emailAddress, string callbackUrl)
        {
            throw new NotImplementedException();
        }

        public string GenerateConfirmEmailAddressEmail(string emailAddress, string callbackUrl)
        {
            throw new NotImplementedException();
        }

        public string GenerateResetPasswordEmail(ForgotPasswordModel model, string callbackUrl)
        {
            throw new NotImplementedException();
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
