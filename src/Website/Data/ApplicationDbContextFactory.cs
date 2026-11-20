using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseNpgsql("Host=localhost;Database=nldb_design", npgsqlOptions =>
            {
                npgsqlOptions.MigrationsHistoryTable(HistoryRepository.DefaultTableName, "identity");
            });

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
