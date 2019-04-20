﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using System.Threading.Tasks;
using Website.Services;

namespace Website.Infrastructure
{
    public static class ApplicationBuilderExtensions
    {
        public static void CreateAdminUser(this IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
                var config = serviceScope.ServiceProvider.GetRequiredService<IConfiguration>();

                if (userManager is null || config is null)
                {
                    return;
                }

                var adminEmail = config["AdminEmail"];
                var adminUsername = config["AdminUsername"];
                var adminPassword = config["AdminPassword"];
                var adminId = config["AdminUserId"];

                var admin = userManager.FindByEmailAsync(adminEmail).Result;

                if (admin is null)
                {
                    admin = new IdentityUser(adminUsername)
                    {
                        Id = adminId
                    };

                    var result = userManager.CreateAsync(admin).Result;
                    result = userManager.SetEmailAsync(admin, adminEmail).Result;
                    result = userManager.AddPasswordAsync(admin, adminPassword).Result;
                    result = userManager.AddClaimAsync(admin, new Claim(ClaimTypes.Role, "admin")).Result;
                    var code = userManager.GenerateEmailConfirmationTokenAsync(admin).Result;
                    result = userManager.ConfirmEmailAsync(admin, code).Result;
                }
            }
        }

        public static async Task MigrateOldDatabase(this IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var migrator = serviceScope.ServiceProvider.GetRequiredService<IMigrateOldDatabase>();
                migrator.MigrateUsers();
                await migrator.MigrateBosses();
                await migrator.MigrateCharacters();
                await migrator.MigrateCurses();
                await migrator.MigrateFloors();
                await migrator.MigrateItems();
                await migrator.MigrateItemSources();
                await migrator.MigrateThreats();
                await migrator.MigrateTransformations();
                await migrator.MigrateVideos();
                // await migrator.MigrateQuotes();
                await migrator.MigrateRuns();
            }
        }

        public static void ResetDatabaseInDevMode(this IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var dbManager = serviceScope.ServiceProvider.GetRequiredService<IDbManager>();
                dbManager.DropTablesInDevMode();
                dbManager.CreateAllTables();
            }
        }
    }
}