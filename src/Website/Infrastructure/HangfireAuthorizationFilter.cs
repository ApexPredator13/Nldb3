using Hangfire.Annotations;
using Hangfire.Dashboard;
using System.Linq;
using System.Security.Claims;

namespace Website.Infrastructure
{
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize([NotNull] DashboardContext context)
        {
            var user = context.GetHttpContext().User;

            if (user.Claims.Any(x => x.Type == ClaimTypes.Role && x.Value == "admin"))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}


