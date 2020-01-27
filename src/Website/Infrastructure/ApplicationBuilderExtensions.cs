using IdentityServer4.EntityFramework.DbContexts;
using IdentityServer4.EntityFramework.Mappers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Website.Data;
using Website.Services;

namespace Website.Infrastructure
{
    public static class ApplicationBuilderExtensions
    {
        public static void PrepareDatabase(this IApplicationBuilder app)
        {
            using var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope();
            var npgsql = serviceScope.ServiceProvider.GetRequiredService<INpgsql>();
            var hostingEnvironment = serviceScope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
            var dbManager = new DbManager(npgsql, hostingEnvironment);
            dbManager.CreateAllTablesIfNotExists();
        }

        public static void ApplyEntityFrameworkDatabaseMigrations(this IApplicationBuilder app)
        {
            using var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope();

            var applicationDbContext = serviceScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var applicationDbContextMigrator = applicationDbContext.GetInfrastructure().GetService<IMigrator>();
            applicationDbContextMigrator.Migrate();

            var configurationDbContext = serviceScope.ServiceProvider.GetRequiredService<ConfigurationDbContext>();
            var configurationDbContextMigrator = configurationDbContext.GetInfrastructure().GetService<IMigrator>();
            configurationDbContextMigrator.Migrate();

            var persistedGrantDbContext = serviceScope.ServiceProvider.GetRequiredService<PersistedGrantDbContext>();
            var persistedGrantDbContextMigrator = persistedGrantDbContext.GetInfrastructure().GetService<IMigrator>();
            persistedGrantDbContextMigrator.Migrate();
        }

        public static void CreateIdentityserverEntriesIfNecessary(this IApplicationBuilder app, bool deleteExistingData = false)
        {
            using var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope();
            var configurationDbContext = serviceScope.ServiceProvider.GetRequiredService<ConfigurationDbContext>();
            var config = serviceScope.ServiceProvider.GetRequiredService<IConfiguration>();

            if (deleteExistingData)
            {
                var clients = configurationDbContext.Clients.ToList();
                var identityResources = configurationDbContext.IdentityResources.ToList();

                configurationDbContext.Clients.RemoveRange(clients);
                configurationDbContext.IdentityResources.RemoveRange(identityResources);
                configurationDbContext.SaveChanges();
            }

            if (!configurationDbContext.Clients.Any())
            {
                var clients = IdentityserverResources.Clients(config);

                foreach (var client in clients)
                {
                    configurationDbContext.Clients.Add(client.ToEntity());
                }
            }

            if (!configurationDbContext.IdentityResources.Any())
            {
                var identityResources = IdentityserverResources.IdentityResources();

                foreach (var identityResource in identityResources)
                {
                    configurationDbContext.IdentityResources.Add(identityResource.ToEntity());
                }
            }

            configurationDbContext.SaveChanges();
        }

        public static void CreateRequiredUserAccountsIfMissing(this IApplicationBuilder app, bool resetTestaccount)
        {
            using var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope();

            // migrate identityserver 

            var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var config = serviceScope.ServiceProvider.GetRequiredService<IConfiguration>();

            if (userManager is null || config is null)
            {
                return;
            }

            // create admin account
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

            // create [removed user] account
            var removedUserName = config["DeletedUserName"];
            var removedUserId = config["DeletedUserId"];

            var removedUser = userManager.FindByIdAsync(removedUserId).Result;

            if (removedUser is null)
            {
                removedUser = new IdentityUser(removedUserName)
                {
                    Id = removedUserId
                };

                var result = userManager.CreateAsync(removedUser).Result;
            }

            // clear test user account if required
            if (resetTestaccount)
            {
                var testEmail = config["TestuserEmail"];
                var testUser = userManager.FindByEmailAsync(testEmail).Result;
                if (testUser != null)
                {
                    userManager.DeleteAsync(testUser).Wait();
                }
            }
        }

        public static async Task MigrateOldDatabaseIfNoDataExists(this IApplicationBuilder app)
        {
            using var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope();
            var migrator = serviceScope.ServiceProvider.GetRequiredService<IMigrateOldDatabase>();
            migrator.MigrateUsers();
            await migrator.MigrateMods();
            await migrator.MigrateTransformations();
            await migrator.MigrateBosses();
            await migrator.MigrateCharacters();
            await migrator.MigrateCurses();
            await migrator.MigrateFloors();
            await migrator.MigrateItems();
            await migrator.MigrateItemSources();
            await migrator.MigrateThreats();
            await migrator.MigrateVideos();
            await migrator.MigrateQuotes();
            await migrator.MigrateRuns();
        }

        public static void ResetDatabaseInDevMode(this IApplicationBuilder app)
        {
            using var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope();
            var dbManager = serviceScope.ServiceProvider.GetRequiredService<IDbManager>();
            dbManager.DropTablesInDevMode();
            dbManager.CreateAllTablesIfNotExists();
        }
    }
}
