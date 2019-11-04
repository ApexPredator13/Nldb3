using IdentityServer4;
using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
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
                new IdentityResources.Profile()
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
                    ClientSecrets = { new Secret(config["IdentityserverClientSecret"]) },
                    AllowedGrantTypes = GrantTypes.Implicit,
                    AllowedScopes = { IdentityServerConstants.StandardScopes.OpenId, IdentityServerConstants.StandardScopes.Profile, IdentityServerConstants.StandardScopes.OfflineAccess },
                    AccessTokenType = AccessTokenType.Reference,
                    AllowOfflineAccess = true,
                    AlwaysSendClientClaims = true,
                    Enabled = true,
                    ClientName = "Local Javascript App",
                    AllowedCorsOrigins = { "https://www.northernlion-db.com", "https://northernlion-db.com", "https://localhost:5005" },
                    RedirectUris = { "https://www.northernlion-db.com", "https://northernlion-db.com", "https://localhost:5005" },
                    PostLogoutRedirectUris = { "https://www.northernlion-db.com", "https://northernlion-db.com", "https://localhost:5005" },
                    RequireConsent = false
                }
            };
        }
    }
}
