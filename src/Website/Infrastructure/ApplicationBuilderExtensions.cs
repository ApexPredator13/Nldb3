using Microsoft.AspNetCore.Builder;
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
        public static void CreateRequiredUserAccountsIfMissing(this IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
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
            }
        }

        public static async Task MigrateOldDatabaseIfNoDataExists(this IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
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
