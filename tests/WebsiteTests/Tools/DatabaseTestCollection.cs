using Xunit;

namespace WebsiteTests.Tools
{
    [CollectionDefinition("database_tests")]
    public class DatabaseTestCollection : ICollectionFixture<DatabaseTestFixture> { }
}
