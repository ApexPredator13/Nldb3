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


        // This method gets called by the runtime. Use this method to add services to the container.
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

            services.AddTransient<IDbConnector, DbConnector>();
            services.AddTransient<IDbManager, DbManager>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddTransient<IMigrateOldDatabase, MigrateOldDatabase>();
            services.AddTransient<IIsaacIconManager, IsaacIconManager>();

            services.AddScoped<IIsaacRepository, IsaacRepository>();
            services.AddScoped<IModRepository, ModRepository>();
            services.AddScoped<IVideoRepository, VideoRepository>();
            services.AddScoped<IQuoteRepository, QuoteRepository>();

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
            services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(Config.GetConnectionString("DefaultConnection")));

            // identity
            services.AddIdentity<IdentityUser, IdentityRole>(options =>
            {
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(1);
                options.Lockout.MaxFailedAccessAttempts = 10;
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

            services.AddAuthorization(options =>
            {
                options.AddPolicy("admin", policy =>
                {
                    policy.RequireClaim("admin");
                });
            });

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
        }


        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.Use((context, next) =>
            {
                var csp = new StringValues(
                    "default-src 'self'; " +
                    "child-src 'self' www.youtube.com; " +
                    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
                    "font-src 'self' fonts.gstatic.com; " +
                    "block-all-mixed-content; " +
                    (env.IsDevelopment() ? "script-src 'self' 'unsafe-eval' www.youtube.com" : string.Empty));

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

            app.UseAuthorization();
            app.UseAuthentication();

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseHangfireDashboard("/hangfire", new DashboardOptions()
            {
                Authorization = new List<IDashboardAuthorizationFilter>()
                {
                    new HangfireAuthorizationFilter()
                }
            });
            
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute("video", "/Video/{id}", new { Controller = Controllers.VideoController.Controllername, Action = nameof(Controllers.VideoController.Index) });
                endpoints.MapControllerRoute("area", "{area:exists}/{controller=Home}/{action=Index}/{id?}");
                endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
            });

            app.CreateRequiredUserAccountsIfMissing();

            //app.ResetDatabaseInDevMode();
            //BackgroundJob.Enqueue<IMigrateOldDatabase>(migrator => migrator.MigrateEverything());

            // RecurringJob.AddOrUpdate<ISqlDumper>(dumper => dumper.Dump(), Cron.Hourly());
        }
    }
}
