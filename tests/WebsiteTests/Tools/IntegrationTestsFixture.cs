using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace WebsiteTests.Tools
{
    [CollectionDefinition("IntegrationTests")]
    public class IntegrationTestsCollection : ICollectionFixture<IntegrationTestsFixture> { }

    public class IntegrationTestsFixture : IDisposable
    {
        private readonly WebApplicationFactory<Website.Startup> _webApp;
        private readonly TestServer _testServer;

        public IntegrationTestsFixture()
        {
            // configuration
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");

            var config = new ConfigurationBuilder().AddUserSecrets<Website.Startup>().Build();
            var connectionString = config.GetConnectionString("TestConnection");

            // wipe test database
            using var connection = new NpgsqlConnection(connectionString);
            connection.Open();
            using var command = new NpgsqlCommand("DROP SCHEMA public CASCADE; CREATE SCHEMA public;", connection);
            command.ExecuteNonQuery();

            // create test server
            _webApp = new WebApplicationFactory<Website.Startup>()
                .WithWebHostBuilder(builder =>
                {
                    builder.ConfigureAppConfiguration(configure =>
                    {
                        configure.AddUserSecrets<Website.Startup>();
                    });
                });
        }

        /// <summary>
        /// creates a new ServiceScope that can be used to resolve services for integration tests
        /// </summary>
        /// <returns>the created service scope</returns>
        public IServiceScope CreateScope() => _webApp.Services.CreateScope();

        public void Dispose()
        {
            GC.SuppressFinalize(this);
            return;
        }
    }
}
