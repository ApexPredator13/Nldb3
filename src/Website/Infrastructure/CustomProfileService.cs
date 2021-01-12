using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Website.Infrastructure
{
    public class CustomProfileService : IProfileService
    {
        private readonly UserManager<IdentityUser> _userManager;

        public CustomProfileService(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            var userClaim = context.Subject.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)
                ?? context.Subject.Claims.FirstOrDefault(c => c.Type == "name")
                ?? context.Subject.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email);

            if (userClaim is not null)
            {
                context.IssuedClaims.Add(userClaim);
            }


            var user = await _userManager.GetUserAsync(context.Subject);

            if (user is not null)
            {
                var claims = await _userManager.GetClaimsAsync(user);
                var roleClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.Role && c.Value == "admin");

                if (roleClaim is not null)
                {
                    context.IssuedClaims.Add(roleClaim);
                }
            }

            return;
        }

        public Task IsActiveAsync(IsActiveContext context)
        {
            context.IsActive = true;
            return Task.FromResult(0);
        }
    }
}
