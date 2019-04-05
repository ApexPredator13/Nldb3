using Microsoft.EntityFrameworkCore;
using Website.Models.Isaac;

namespace Website.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Video> Videos { get; set; }
        public DbSet<IsaacResource> IsaacResources { get; set; }
        public DbSet<IsaacResourceTag> IsaacEffects { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Mod> Mods { get; set; }
    }
}
