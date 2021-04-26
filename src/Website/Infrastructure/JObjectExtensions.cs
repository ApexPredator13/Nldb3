using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace Website.Infrastructure
{
    public static class JObjectExtensions
    {
        public static void From(this JObject message, string fromEmail, string? fromName)
        {
            message.Add("From", new JObject
            {
                { "Email", fromEmail },
                { "Name", fromName ?? fromEmail }
            });
        }

        public static void To(this JObject message, string toEmail, string? toName)
        {
            message.Add("To", new JArray
            {
                new JObject
                {
                    { "Email", toEmail },
                    { "Name", toName ?? toEmail }
                }
            });
        }

        public static void Subject(this JObject message, string subject)
        {
            message.Add("Subject", subject);
        }

        public static void Html(this JObject message, string html)
        {
            message.Add("HTMLPart", html);
        }
    }
}
