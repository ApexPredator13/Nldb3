using Xunit;

namespace WebsiteTests.Tools
{
    [CollectionDefinition("database_tests")]
    public class IntegrationtestCollection : ICollectionFixture<IntegrationtestFixture> { }
}
