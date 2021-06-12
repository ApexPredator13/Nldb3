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
using System.Security.Cryptography.X509Certificates;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication.Cookies;

using static OpenIddict.Abstractions.OpenIddictConstants;
using Microsoft.AspNetCore.Http;

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
                    .UsePostgreSqlStorage(Config.GetConnectionString("DefaultConnection"), new PostgreSqlStorageOptions()
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
                options.UseOpenIddict();
            });

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
                .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
                {
                    options.LoginPath = "/Account/Login";
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

            services.AddControllersWithViews();

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

            var signingCertificatePath = Path.Combine(_env.ContentRootPath, "nldb.pfx");
            var signingCertificatePassword = Config["CertificatePassword"];
            var signingCertificate = new X509Certificate2(signingCertificatePath, signingCertificatePassword);
            if (signingCertificate is null)
            {
                throw new Exception("no signing certificate found");
            }


            var encryptionCertificatePath = Path.Combine(_env.ContentRootPath, "nldb_enc.pfx");
            var encryptionCertificatePassword = Config["EncryptionCertificatePassword"];
            var encryptionCertificate = new X509Certificate2(encryptionCertificatePath, encryptionCertificatePassword, X509KeyStorageFlags.EphemeralKeySet);
            if (encryptionCertificate is null)
            {
                throw new Exception("no signing certificate found");
            }


            var issuer = _env.IsDevelopment() 
                ? "https://localhost:5005" 
                : "https://northernlion-db.com";

            services.AddOpenIddict()
            .AddCore(options =>
                {
                    options.UseEntityFrameworkCore()
                        .UseDbContext<ApplicationDbContext>();
                })

            // Register the OpenIddict server components.
            .AddServer(options =>
            {
                options.SetAuthorizationEndpointUris("/connect/authorize")
                        .SetLogoutEndpointUris("/Account/Logout")
                        .SetTokenEndpointUris("/connect/token")
                        .SetUserinfoEndpointUris("/connect/userinfo")
                        .SetIssuer(new Uri(issuer));

                options.RegisterScopes(Scopes.Email, Scopes.Profile, Scopes.Roles);
                options.AllowAuthorizationCodeFlow()
                        .AllowRefreshTokenFlow()
                        .UseReferenceRefreshTokens()
                        .UseReferenceAccessTokens();

                options
                    .AddSigningCertificate(signingCertificate)
                    .AddEncryptionCertificate(encryptionCertificate);

                options.UseAspNetCore()
                        .EnableAuthorizationEndpointPassthrough()
                        .EnableLogoutEndpointPassthrough()
                        .EnableStatusCodePagesIntegration()
                        .EnableTokenEndpointPassthrough()
                        .DisableTransportSecurityRequirement();
            })

            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
            });

            var dataFolder = Path.Combine(_env.ContentRootPath, "AuthState");
            Directory.CreateDirectory(dataFolder);
            var info = new DirectoryInfo(dataFolder);

            services.AddDataProtection()
                .PersistKeysToFileSystem(info)
                .SetApplicationName("NLDB3")
                .SetDefaultKeyLifetime(TimeSpan.FromDays(30));

            services.AddHostedService<Worker>();
        }


        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.ApplyEntityFrameworkDatabaseMigrations();

            app.UseCors(x =>
            {
                x.AllowAnyOrigin();
                x.AllowAnyHeader();
                x.AllowAnyMethod();
            });

            var forwardOptions = new ForwardedHeadersOptions()
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
                RequireHeaderSymmetry = false
            };

            forwardOptions.KnownNetworks.Clear();
            forwardOptions.KnownProxies.Clear();

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
                // silent signin
                endpoints.MapControllerRoute("silent_signin", "/SilentSignin", new { controller = Controllers.HomeController.Controllername, action = nameof(Controllers.HomeController.SilentSignin) });
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

