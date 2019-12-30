using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Website.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Website.Infrastructure;
using Website.Services;
using Microsoft.Extensions.Hosting;
using Website.Migrations;
using Microsoft.Extensions.Primitives;
using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Dashboard;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using IdentityServer4;
using IdentityServer4.EntityFramework;
using System.Reflection;
using IdentityServer4.Services;

namespace Website
{
    public class Startup
    {
        public IConfiguration Config { get; }
        private readonly IWebHostEnvironment _env;

        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Config = configuration;
            _env = env;
        }


        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            // nldb stuff
            services.AddTransient<ISqlDumper, SqlDumper>();
            services.AddSingleton<IHttpClientProvider, HttpClientProvider>();

            services.AddTransient<INpgsql, Data.Npgsql>();
            services.AddTransient<IDbManager, DbManager>();
            services.AddTransient<IMigrateOldDatabase, MigrateOldDatabase>();
            services.AddTransient<IIsaacIconManager, IsaacIconManager>();
            services.AddTransient<IEditSubmissionRepository, EditSubmissionRepository>();

            services.AddTransient<IIsaacRepository, IsaacRepository>();
            services.AddTransient<IModRepository, ModRepository>();
            services.AddTransient<IVideoRepository, VideoRepository>();
            services.AddTransient<IQuoteRepository, QuoteRepository>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IBarGraphCreator, BarGraphCreator>();
            services.AddTransient<IDiscussionTopicsRepository, DiscussionTopicsRepository>();

            // hangfire
            services.AddHangfire(config => config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(Config.GetConnectionString("DefaultConnection"), new PostgreSqlStorageOptions()
                {
                    QueuePollInterval = TimeSpan.FromMinutes(1)
                })
            );
            services.AddHangfireServer();

            // entity framework
            var dbContextConnectionString = Config.GetConnectionString("DefaultConnection");
            services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(dbContextConnectionString));

            // identity
            services.AddIdentity<IdentityUser, IdentityRole>(options =>
            {
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(1);
                options.Lockout.MaxFailedAccessAttempts = 50;
                options.Lockout.AllowedForNewUsers = true;
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 1;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;
                options.User.AllowedUserNameCharacters = string.Empty;
                options.User.RequireUniqueEmail = false;
            })
                .AddDefaultTokenProviders()
                .AddEntityFrameworkStores<ApplicationDbContext>();

            services.AddAuthentication()
                .AddFacebook(options =>
                {
                    options.AppId = Config["FacebookAppId"];
                    options.AppSecret = Config["FacebookAppSecret"];
                })
                .AddTwitter(options =>
                {
                    options.ConsumerKey = Config["TwitterConsumerKey"];
                    options.ConsumerSecret = Config["TwitterConsumerSecret"];
                })
                .AddGoogle(options =>
                {
                    options.ClientId = Config["GoogleClientId"];
                    options.ClientSecret = Config["GoogleClientSecret"];
                })
                .AddSteam(options =>
                {
                    options.ApplicationKey = Config["SteamApplicationKey"];
                })
                .AddTwitch(options =>
                {
                    options.ClientId = _env.IsDevelopment() ? Config["TwitchClientId_Development"] : Config["TwitchClientId_Production"];
                    options.ClientSecret = _env.IsDevelopment() ? Config["TwitchClientSecret_Development"] : Config["TwitchClientSecret_Production"];
                });

            services.AddMvc()
                .AddRazorRuntimeCompilation()   // necessary during .net core 3 preview only? maybe safe to remove this line later
                .AddNewtonsoftJson();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("admin", policy =>
                {
                    policy.RequireClaim(ClaimTypes.Role, "admin");
                });
            });

            var certPath = Path.Combine(_env.ContentRootPath, "nldb.pfx");
            var cert = new X509Certificate2(certPath, Config["CertificatePassword"]);
            if (cert is null)
            {
                throw new Exception("no signing certificate found");
            }

            var migrationsAssembly = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;
            services.AddIdentityServer(config =>
            {
                config.IssuerUri = "https://www.northernlion-db.com";
                config.UserInteraction.LoginUrl = "/Account/Login";
                config.UserInteraction.LogoutUrl = "/Account/Logout";
                config.UserInteraction.ErrorUrl = "/Error";
            })
                .AddSigningCredential(cert)
                .AddAspNetIdentity<IdentityUser>()
                .AddConfigurationStore(config =>
                {
                    config.DefaultSchema = "identity";
                    config.ConfigureDbContext = builder =>
                    {
                        builder.UseNpgsql(dbContextConnectionString, npgsqlOptions =>
                        {
                            npgsqlOptions.MigrationsAssembly(migrationsAssembly);
                        });
                    };
                })
                .AddOperationalStore(config =>
                {
                    config.DefaultSchema = "identity";
                    config.EnableTokenCleanup = true;
                    config.ConfigureDbContext = builder =>
                    {
                        builder.UseNpgsql(dbContextConnectionString, npgsqlOptions =>
                        {
                            npgsqlOptions.MigrationsAssembly(migrationsAssembly);
                        });
                    };
                });
        }


        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors(x =>
            {
                x.AllowAnyOrigin();
                x.AllowAnyHeader();
                x.AllowAnyMethod();
            });

            app.Use((context, next) =>
            {
                var csp = new StringValues(
                    "default-src 'self'; " +
                    "frame-src 'self' https://www.youtube.com; " +
                    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
                    "font-src 'self' fonts.gstatic.com; " +
                    "img-src 'self' https://i.ytimg.com; " +
                    "block-all-mixed-content; " +
                    (env.IsDevelopment()
                        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' www.youtube.com s.ytimg.com; "
                        : "script-src 'self' www.youtube.com; s.ytimg.com;")
                    );

                context.Response.Headers.Add("Content-Security-Policy", csp);
                return next();
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseCookiePolicy();
            app.UseHttpsRedirection();

            app.UseStaticFiles();

            app.UseRouting();

            app.UseIdentityServer();
            app.UseAuthorization();

            app.UseHangfireDashboard("/hangfire", new DashboardOptions()
            {
                Authorization = new List<IDashboardAuthorizationFilter>()
                {
                    new HangfireAuthorizationFilter()
                }
            });

            app.UseEndpoints(endpoints =>
            {
                // silent signin
                endpoints.MapControllerRoute("silent_signin", "/SilentSignin", new { controller = Controllers.HomeController.Controllername, action = nameof(Controllers.HomeController.SilentSignin) });
                endpoints.MapControllerRoute("defaultArea", "{area:exists}/{controller=home}/{action=index}/{id?}");
                endpoints.MapControllerRoute("default", "{controller=home}/{action=index}/{id?}");
            });

            app.ApplyEntityFrameworkDatabaseMigrations();
            app.CreateIdentityserverEntriesIfNecessary(true);
            app.CreateRequiredUserAccountsIfMissing(true);

            //BackgroundJob.Enqueue<IMigrateOldDatabase>(migrator => migrator.MigrateUsersQuotesVideosAndRuns());

            RecurringJob.AddOrUpdate<ISqlDumper>(dumper => dumper.Dump(), Cron.Hourly());
            RecurringJob.AddOrUpdate<IVideoRepository>("update-videos", repo => repo.GetVideosThatNeedYoutubeUpdate(1, true), Cron.Hourly);
        }
    }
}

