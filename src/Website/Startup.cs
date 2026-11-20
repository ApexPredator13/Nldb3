using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Website.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Website.Infrastructure;
using Website.Services;
using Microsoft.Extensions.Hosting;
using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Dashboard;
using System.Security.Claims;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
            // nldb stuff
            services.AddTransient<ISqlDumper, SqlDumper>();
            services.AddSingleton<IHttpClientProvider, HttpClientProvider>();

            services.AddTransient<INpgsql, Data.Npgsql>();
            services.AddTransient<IDbManager, DbManager>();
            services.AddTransient<IIsaacIconManager, IsaacIconManager>();
            services.AddTransient<IEditSubmissionRepository, EditSubmissionRepository>();

            services.AddTransient<IIsaacRepository, IsaacRepository>();
            services.AddTransient<IModRepository, ModRepository>();
            services.AddTransient<IVideoRepository, VideoRepository>();
            services.AddTransient<IQuoteRepository, QuoteRepository>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IBarGraphCreator, BarGraphCreator>();
            services.AddTransient<IDiscussionTopicsRepository, DiscussionTopicsRepository>();

            // necessary to receive youtube push notifications
            services.Configure<KestrelServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });

            // hangfire
            if (_env.EnvironmentName != "Testing")
            {
                services.AddHangfire(config => config
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(Config.GetConnectionString("DefaultConnection")), new PostgreSqlStorageOptions()
                    {
                        QueuePollInterval = TimeSpan.FromMinutes(1)
                    })
                );
                services.AddHangfireServer();
            }

            // entity framework
            var dbContextConnectionString = _env.EnvironmentName == "Testing" 
                ? Config.GetConnectionString("TestConnection") 
                : Config.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options => {
                options.UseNpgsql(dbContextConnectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsHistoryTable(HistoryRepository.DefaultTableName, "identity");
                });
            });

            // identity
            services.AddIdentity<IdentityUser, IdentityRole>(options =>
            {
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 10;
                options.Password.RequiredUniqueChars = 4;
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

            services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = "/Account/Login";
                options.AccessDeniedPath = "/Account/AccessDenied";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Events.OnRedirectToLogin = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/Api") || context.Request.Path.StartsWithSegments("/Admin"))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    }

                    context.Response.Redirect(context.RedirectUri);
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/Api") || context.Request.Path.StartsWithSegments("/Admin"))
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }

                    context.Response.Redirect(context.RedirectUri);
                    return Task.CompletedTask;
                };
            });

            services.AddAuthentication()
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
                    options.CorrelationCookie.SameSite = SameSiteMode.None;
                    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
                })
                .AddTwitch(options =>
                {
                    options.ClientId = _env.IsDevelopment() ? Config["TwitchClientId_Development"] : Config["TwitchClientId_Production"];
                    options.ClientSecret = _env.IsDevelopment() ? Config["TwitchClientSecret_Development"] : Config["TwitchClientSecret_Production"];
                    options.CorrelationCookie.SameSite = SameSiteMode.None;
                    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
                });

            services.AddAntiforgery(options =>
            {
                options.HeaderName = "RequestVerificationToken";
            });

            services.AddControllersWithViews(options =>
            {
                options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
            })
                .AddNewtonsoftJson();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("admin", policy =>
                {
                    policy.RequireClaim(ClaimTypes.Role, "admin");
                });
            });

            var dataFolder = Path.Combine(_env.ContentRootPath, "AuthState");
            Directory.CreateDirectory(dataFolder);
            var info = new DirectoryInfo(dataFolder);

            services.AddDataProtection()
                .PersistKeysToFileSystem(info)
                .SetApplicationName("NLDB3")
                .SetDefaultKeyLifetime(TimeSpan.FromDays(30));
        }


        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.ApplyEntityFrameworkDatabaseMigrations();

            // headers for cloudflare tunnel
            var forwardOptions = new ForwardedHeadersOptions()
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
                ForwardLimit = 1,
                RequireHeaderSymmetry = false
            };

            app.UseForwardedHeaders(forwardOptions);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            if (env.EnvironmentName != "Testing")
            {
                app.UseHangfireDashboard("/hangfire", new DashboardOptions()
                {
                    Authorization = new List<IDashboardAuthorizationFilter>()
                {
                    new HangfireAuthorizationFilter()
                }
                });
            }

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute("default", "{controller=home}/{action=index}/{id?}");
                endpoints.MapFallbackToController("index", "home");
            });

            app.UseWelcomePage();
            app.PrepareDatabase();
            app.CreateRequiredUserAccountsIfMissing(env.IsDevelopment() ? true : false);

            if (env.EnvironmentName != "Testing")
            {
                RecurringJob.AddOrUpdate<ISqlDumper>("sql-dump", dumper => dumper.Dump(), Cron.Hourly());
                RecurringJob.AddOrUpdate<IVideoRepository>("update-videos", repo => repo.GetVideosThatNeedYoutubeUpdate(40, true), Cron.Hourly());
            }
        }
    }
}

