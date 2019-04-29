using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Website.Data;
using Website.Infrastructure;
using Website.Migrations;
using Website.Services;

namespace WebsiteTests.Tools
{
    // gimped version of startup, to test database functionality
    public class Startup
    {
        public Startup() { }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddTransient<IDbConnector, DbConnector>();
            services.AddTransient<IDbManager, DbManager>();

            services.AddTransient<IIsaacRepository, IsaacRepository>();
            services.AddTransient<IModRepository, ModRepository>();
            services.AddTransient<IVideoRepository, VideoRepository>();

            services.AddTransient<IIsaacIconManager, IsaacIconManager>();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.ResetDatabaseInDevMode();
        }
    }

    public class DatabaseTestFixture : IDisposable
    {
        public TestServer TestServer { get; }

        public DatabaseTestFixture()
        {
            // create fake config
            var config = new ConfigurationBuilder()
                .AddUserSecrets<Website.Startup>(false, true)
                .Build();

            // switch to test connection string
            config["ConnectionStrings:DefaultConnection"] = config.GetConnectionString("TestConnection");

            // create dummy AspNetUsers table because the user id is required
            using (var c = new NpgsqlConnection(config.GetConnectionString("TestConnection")))
            {
                c.Open();
                using (var q = new NpgsqlCommand("CREATE TABLE IF NOT EXISTS \"AspNetUsers\" (\"Id\" TEXT PRIMARY KEY);", c))
                {
                    q.ExecuteNonQuery();
                }
            }

            // provide fake wwwroot and contentroot folders
            var contentRoot = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot");
            var wwwRoot = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot");
            Directory.CreateDirectory(contentRoot);
            Directory.CreateDirectory(wwwRoot);

            // create web host
            var webHost = new WebHostBuilder()
                .UseConfiguration(config)
                .UseContentRoot(contentRoot)
                .UseWebRoot(wwwRoot)
                .UseEnvironment("Development")
                .UseStartup<Startup>();

            // start server
            TestServer = new TestServer(webHost);

            // configure autofixture
        }

        public IDbConnector TestDbConnector()
        {
            return TestServer.Host.Services.GetService(typeof(IDbConnector)) as IDbConnector;
        }


        public void Dispose()
        {
            TestServer.Dispose();
        }
    }
}
