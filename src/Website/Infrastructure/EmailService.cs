using Mailjet.Client;
using Mailjet.Client.Resources;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Newtonsoft.Json.Linq;
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

        public async Task<MailjetResponse> SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var apiKey = _config["MailjetApiKey"];
            var apiSecret = _config["MailjetApiSecret"];
            var from = _config["AdminEmail"];

            var mailjetClient = new MailjetClient(apiKey, apiSecret);

            var message = new JObject();
            message.From(from, from);
            message.To(email, email);
            message.Subject(subject);
            message.Html(htmlMessage);

            var request = new MailjetRequest
            {
                Resource = Send.Resource
            }
            .Property(Send.Messages, new JArray() { message });

            var response = await mailjetClient.PostAsync(request);
            return response;
        }
    }
}

