using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Security.Claims;
using Website.Data;
using Website.Services;

namespace Website.Infrastructure
{
    public static class ApplicationBuilderExtensions
    {
        public static IServiceScope CreateScope(IApplicationBuilder app)
        {
            var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>();

            if (serviceScope is null)
            {
                throw new NullReferenceException("Service Scope is null...?");
            }

            return serviceScope.CreateScope();
        }

        public static void PrepareDatabase(this IApplicationBuilder app)
        {
            using var serviceScope = CreateScope(app);
            var npgsql = serviceScope.ServiceProvider.GetRequiredService<INpgsql>();
            var hostingEnvironment = serviceScope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            var dbManager = new DbManager(npgsql, hostingEnvironment);
            dbManager.CreateAllTablesIfNotExists();
        }

        public static void ApplyEntityFrameworkDatabaseMigrations(this IApplicationBuilder app)
        {
            using var serviceScope = CreateScope(app);

            var applicationDbContext = serviceScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var applicationDbContextMigrator = applicationDbContext.GetInfrastructure().GetService<IMigrator>();

            if (applicationDbContextMigrator is not null)
            {
                applicationDbContextMigrator.Migrate();
            }
        }

        public static void CreateRequiredUserAccountsIfMissing(this IApplicationBuilder app, bool resetTestaccount)
        {
            using var serviceScope = CreateScope(app);

            var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var config = serviceScope.ServiceProvider.GetRequiredService<IConfiguration>();
            var logger = serviceScope.ServiceProvider.GetService<ILoggerFactory>()?.CreateLogger("StartupAccountSeeding");

            void LogIfFailed(string step, IdentityResult result)
            {
                if (!result.Succeeded)
                {
                    var errors = string.Join("; ", result.Errors.Select(e => $"{e.Code}: {e.Description}"));
                    logger?.LogError("Admin/seed account step '{Step}' failed: {Errors}", step, errors);
                }
            }

            // create admin account
            var adminEmail = config["AdminEmail"];
            var adminUsername = config["AdminUsername"];
            var adminPassword = config["AdminPassword"];
            var adminId = config["AdminUserId"];

            if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminUsername))
            {
                var admin = userManager.FindByEmailAsync(adminEmail).Result
                    ?? (!string.IsNullOrWhiteSpace(adminId) ? userManager.FindByIdAsync(adminId).Result : null)
                    ?? userManager.FindByNameAsync(adminUsername).Result;

                if (admin is null)
                {
                    admin = new IdentityUser(adminUsername);
                    if (!string.IsNullOrWhiteSpace(adminId))
                    {
                        admin.Id = adminId;
                    }

                    var createResult = userManager.CreateAsync(admin).Result;
                    LogIfFailed("CreateAdmin", createResult);
                    if (!createResult.Succeeded)
                    {
                        admin = null;
                    }
                }

                if (admin is not null)
                {
                    if (!string.Equals(admin.Email, adminEmail, StringComparison.OrdinalIgnoreCase))
                    {
                        LogIfFailed("SetAdminEmail", userManager.SetEmailAsync(admin, adminEmail).Result);
                    }

                    if (!userManager.HasPasswordAsync(admin).Result)
                    {
                        if (string.IsNullOrEmpty(adminPassword))
                        {
                            logger?.LogError("Admin account has no password set and 'AdminPassword' is empty in configuration.");
                        }
                        else
                        {
                            LogIfFailed("AddAdminPassword", userManager.AddPasswordAsync(admin, adminPassword).Result);
                        }
                    }

                    var existingClaims = userManager.GetClaimsAsync(admin).Result;
                    if (!existingClaims.Any(c => c.Type == ClaimTypes.Role && c.Value == "admin"))
                    {
                        LogIfFailed("AddAdminRoleClaim", userManager.AddClaimAsync(admin, new Claim(ClaimTypes.Role, "admin")).Result);
                    }

                    if (!userManager.IsEmailConfirmedAsync(admin).Result)
                    {
                        var code = userManager.GenerateEmailConfirmationTokenAsync(admin).Result;
                        LogIfFailed("ConfirmAdminEmail", userManager.ConfirmEmailAsync(admin, code).Result);
                    }
                }
            }

            // create [removed user] account
            var removedUserName = config["DeletedUserName"];
            var removedUserId = config["DeletedUserId"];

            if (!string.IsNullOrWhiteSpace(removedUserName) && !string.IsNullOrWhiteSpace(removedUserId))
            {
                var removedUser = userManager.FindByIdAsync(removedUserId).Result;

                if (removedUser is null)
                {
                    removedUser = new IdentityUser(removedUserName)
                    {
                        Id = removedUserId
                    };

                    LogIfFailed("CreateRemovedUser", userManager.CreateAsync(removedUser).Result);
                }
            }
        }

        public static void ResetDatabaseInDevMode(this IApplicationBuilder app)
        {
            using var serviceScope = CreateScope(app);
            var dbManager = serviceScope.ServiceProvider.GetRequiredService<IDbManager>();
            dbManager.DropTablesInDevMode();
            dbManager.CreateAllTablesIfNotExists();
        }
    }
}
