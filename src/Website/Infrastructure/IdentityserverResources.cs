using IdentityServer4;
using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Infrastructure
{
    public static class IdentityserverResources
    {
        public static IEnumerable<IdentityResource> IdentityResources()
        {
            return new List<IdentityResource>()
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
                new IdentityResource("role", "Role", new List<string>() { ClaimTypes.Role })
            };
        }

        public static IEnumerable<Client> Clients(IConfiguration config)
        {
            return new List<Client>()
            {
                new Client()
                {
                    ClientId = "local-javascript-app",
                    AllowAccessTokensViaBrowser = true,
                    RequireClientSecret = false,
                    AllowedGrantTypes = GrantTypes.Code,
                    AllowedScopes = { IdentityServerConstants.StandardScopes.OpenId, IdentityServerConstants.StandardScopes.Profile, "role" },
                    AccessTokenType = AccessTokenType.Reference,
                    AccessTokenLifetime = 900,
                    AllowOfflineAccess = true,
                    AlwaysIncludeUserClaimsInIdToken = true,
                    Enabled = true,
                    ClientName = "Local Javascript App",
                    AllowedCorsOrigins = { 
                        "https://www.northernlion-db.com", "https://northernlion-db.com", "https://localhost:5005"
                    },
                    RedirectUris = { 
                        "https://www.northernlion-db.com", "https://northernlion-db.com", "https://localhost:5005",
                        "https://www.northernlion-db.com/SilentSignin", "https://northernlion-db.com/SilentSignin", "https://localhost:5005/SilentSignin" 
                    },
                    PostLogoutRedirectUris = { "https://www.northernlion-db.com", "https://northernlion-db.com", "https://localhost:5005" },
                    RequireConsent = false,
                    RequirePkce = true
                }
            };
        }
    }
}
