﻿using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Website.Models.Database;

#nullable disable
namespace Website.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Video> Videos { get; set; }
        public DbSet<IsaacResource> IsaacResources { get; set; }
        public DbSet<IsaacResourceTag> IsaacEffects { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Mod> Mods { get; set; }
    }
}
