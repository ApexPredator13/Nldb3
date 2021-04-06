using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
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
            _webApp = new WebApplicationFactory<Website.Startup>();
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
            return;
        }
    }
}
