using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System.Threading.Tasks;

namespace Website.Infrastructure
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _defaultCsp;
        private readonly string _hangfireCsp;

        public SecurityHeadersMiddleware(RequestDelegate next, IWebHostEnvironment env)
        {
            _next = next;

            var connectSrc = env.IsDevelopment()
                ? "'self' ws: wss: http://localhost:* https://localhost:*"
                : "'self'";

            _defaultCsp = string.Join("; ",
                "default-src 'self'",
                "script-src 'self' https://www.youtube.com https://s.ytimg.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https://i.ytimg.com https://*.ytimg.com",
                "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
                $"connect-src {connectSrc}",
                "object-src 'none'",
                "base-uri 'self'",
                "frame-ancestors 'none'");

            // hangfire has some inline stuff and needs lax rules for the dashboard to function
            _hangfireCsp = string.Join("; ",
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data:",
                "font-src 'self' data:",
                $"connect-src {connectSrc}",
                "object-src 'none'",
                "base-uri 'self'",
                "frame-ancestors 'none'");
        }

        public Task InvokeAsync(HttpContext context)
        {
            context.Response.OnStarting(() =>
            {
                var headers = context.Response.Headers;

                headers["X-Content-Type-Options"] = "nosniff";
                headers["X-Frame-Options"] = "DENY";
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";

                if (!headers.ContainsKey("Content-Security-Policy"))
                {
                    var isHangfire = context.Request.Path.StartsWithSegments("/hangfire");
                    headers["Content-Security-Policy"] = isHangfire ? _hangfireCsp : _defaultCsp;
                }

                return Task.CompletedTask;
            });

            return _next(context);
        }
    }
}
