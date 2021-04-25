using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenIddict.Abstractions;
using Org.BouncyCastle.Utilities.Collections;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Website.Data;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Website.Infrastructure
{
    public class Worker : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IWebHostEnvironment _env;

        public Worker(IServiceProvider serviceProvider, IWebHostEnvironment env)
        {
            _serviceProvider = serviceProvider;
            _env = env;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await context.Database.EnsureCreatedAsync(cancellationToken);

            var manager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();

            var existingClient = await manager.FindByClientIdAsync("local-javascript-app", cancellationToken);

            if (existingClient is not null && (_env.IsDevelopment() ||  _env.EnvironmentName == "Testing"))
            {
                await manager.DeleteAsync(existingClient, cancellationToken);
            }

            if (await manager.FindByClientIdAsync("local-javascript-app", cancellationToken) is null)
            {
                await manager.CreateAsync(new OpenIddictApplicationDescriptor
                {
                    ClientId = "local-javascript-app",
                    ClientSecret = null,
                    DisplayName = "Local Javascript App",
                    ConsentType = ConsentTypes.Implicit,
                    Permissions =
                    {
                        Permissions.Endpoints.Token,
                        Permissions.Endpoints.Introspection,
                        Permissions.Endpoints.Logout,
                        Permissions.Endpoints.Revocation,
                        Permissions.Endpoints.Authorization,

                        Permissions.GrantTypes.AuthorizationCode,
                        Permissions.GrantTypes.RefreshToken,

                        Permissions.ResponseTypes.Code,

                        Permissions.Scopes.Profile,
                        Permissions.Scopes.Roles,
                        Permissions.Scopes.Email
                    },
                    RedirectUris =
                    {
                        new Uri("https://www.northernlion-db.com"),
                        new Uri("https://northernlion-db.com"),
                        new Uri("https://localhost:5005"),
                        new Uri("https://localhost:5005"),
                        new Uri("https://www.northernlion-db.com/SilentSignin"),
                        new Uri("https://northernlion-db.com/SilentSignin"),
                        new Uri("https://localhost:5005/SilentSignin"),
                        new Uri("https://localhost:5005/SilentSignin")
                    },
                    PostLogoutRedirectUris =
                    {
                        new Uri("https://www.northernlion-db.com"),
                        new Uri("https://northernlion-db.com"),
                        new Uri("https://localhost:5005"),
                        new Uri("https://localhost:5005")
                    },
                    Requirements =
                    {
                        Requirements.Features.ProofKeyForCodeExchange
                    }
                }, cancellationToken);

                var created = await manager.FindByClientIdAsync("local-javascript-app", cancellationToken);
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}