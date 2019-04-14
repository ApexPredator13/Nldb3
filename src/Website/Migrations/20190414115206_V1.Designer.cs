﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Website.Data;

namespace Website.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20190414115206_V1")]
    partial class V1
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn)
                .HasAnnotation("ProductVersion", "3.0.0-preview3.19153.1")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Name")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasName("RoleNameIndex");

                    b.ToTable("AspNetRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<string>("RoleId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUser", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Email")
                        .HasMaxLength(256);

                    b.Property<bool>("EmailConfirmed");

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256);

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasName("UserNameIndex");

                    b.ToTable("AspNetUsers");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<string>("RoleId");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<string>("LoginProvider");

                    b.Property<string>("Name");

                    b.Property<string>("Value");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens");
                });

            modelBuilder.Entity("Website.Models.Database.Description", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("IsaacResourceId");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasMaxLength(1000);

                    b.Property<int>("ValidFor");

                    b.HasKey("Id");

                    b.HasIndex("IsaacResourceId");

                    b.ToTable("Description");
                });

            modelBuilder.Entity("Website.Models.Database.GameplayEvent", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("EventType");

                    b.Property<int?>("SubmittedEpisodeId");

                    b.HasKey("Id");

                    b.HasIndex("SubmittedEpisodeId");

                    b.ToTable("GameplayEvent");
                });

            modelBuilder.Entity("Website.Models.Database.IsaacResource", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AvailableIn");

                    b.Property<string>("ChallengeSpecificId");

                    b.Property<string>("Color");

                    b.Property<int>("ExistsIn");

                    b.Property<int?>("FromModId");

                    b.Property<int?>("GameplayEventId");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<int>("Type");

                    b.Property<int>("X");

                    b.Property<int>("Y");

                    b.HasKey("Id");

                    b.HasIndex("ChallengeSpecificId");

                    b.HasIndex("FromModId");

                    b.HasIndex("GameplayEventId");

                    b.ToTable("IsaacResources");
                });

            modelBuilder.Entity("Website.Models.Database.IsaacResourceTag", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Effect");

                    b.Property<string>("IsaacResourceId");

                    b.HasKey("Id");

                    b.HasIndex("IsaacResourceId");

                    b.ToTable("IsaacEffects");
                });

            modelBuilder.Entity("Website.Models.Database.Mod", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name")
                        .IsRequired();

                    b.HasKey("Id");

                    b.ToTable("Mods");
                });

            modelBuilder.Entity("Website.Models.Database.ModUrl", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("LinkText")
                        .IsRequired();

                    b.Property<int?>("ModId");

                    b.Property<string>("Url")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("ModId");

                    b.ToTable("ModUrl");
                });

            modelBuilder.Entity("Website.Models.Database.Quote", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ContributorId")
                        .IsRequired();

                    b.Property<string>("QuoteText")
                        .IsRequired();

                    b.Property<int>("SecondsIn");

                    b.Property<DateTime>("SubmissionTime");

                    b.Property<string>("VideoId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("ContributorId");

                    b.HasIndex("VideoId");

                    b.ToTable("Quotes");
                });

            modelBuilder.Entity("Website.Models.Database.SubmittedEpisode", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("ContributedAt");

                    b.Property<string>("ContributorId")
                        .IsRequired();

                    b.Property<string>("VideoId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("ContributorId");

                    b.HasIndex("VideoId");

                    b.ToTable("SubmittedEpisode");
                });

            modelBuilder.Entity("Website.Models.Database.SubmittedEpisodeFlag", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("FlagTime");

                    b.Property<string>("FlaggedById")
                        .IsRequired();

                    b.Property<int>("Reason");

                    b.Property<int?>("SubmittedEpisodeId");

                    b.HasKey("Id");

                    b.HasIndex("FlaggedById");

                    b.HasIndex("SubmittedEpisodeId");

                    b.ToTable("SubmittedEpisodeFlag");
                });

            modelBuilder.Entity("Website.Models.Database.Thumbnail", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Height");

                    b.Property<string>("Type")
                        .IsRequired();

                    b.Property<string>("Url")
                        .IsRequired();

                    b.Property<string>("VideoId");

                    b.Property<int>("Width");

                    b.HasKey("Id");

                    b.HasIndex("VideoId");

                    b.ToTable("Thumbnail");
                });

            modelBuilder.Entity("Website.Models.Database.Video", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("CommentCount");

                    b.Property<int?>("Dislikes");

                    b.Property<TimeSpan>("Duration");

                    b.Property<int?>("FavouriteCount");

                    b.Property<int?>("Likes");

                    b.Property<DateTime>("Published");

                    b.Property<bool>("RequiresUpdate");

                    b.Property<string>("Title")
                        .IsRequired();

                    b.Property<int?>("ViewCount");

                    b.HasKey("Id");

                    b.ToTable("Videos");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole")
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole")
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Website.Models.Database.Description", b =>
                {
                    b.HasOne("Website.Models.Database.IsaacResource")
                        .WithMany("Descriptions")
                        .HasForeignKey("IsaacResourceId");
                });

            modelBuilder.Entity("Website.Models.Database.GameplayEvent", b =>
                {
                    b.HasOne("Website.Models.Database.SubmittedEpisode")
                        .WithMany("EverythingThatHappened")
                        .HasForeignKey("SubmittedEpisodeId");
                });

            modelBuilder.Entity("Website.Models.Database.IsaacResource", b =>
                {
                    b.HasOne("Website.Models.Database.IsaacResource", "ChallengeSpecific")
                        .WithMany()
                        .HasForeignKey("ChallengeSpecificId");

                    b.HasOne("Website.Models.Database.Mod", "FromMod")
                        .WithMany()
                        .HasForeignKey("FromModId");

                    b.HasOne("Website.Models.Database.GameplayEvent")
                        .WithMany("Resources")
                        .HasForeignKey("GameplayEventId");
                });

            modelBuilder.Entity("Website.Models.Database.IsaacResourceTag", b =>
                {
                    b.HasOne("Website.Models.Database.IsaacResource")
                        .WithMany("Tags")
                        .HasForeignKey("IsaacResourceId");
                });

            modelBuilder.Entity("Website.Models.Database.ModUrl", b =>
                {
                    b.HasOne("Website.Models.Database.Mod")
                        .WithMany("ModUrls")
                        .HasForeignKey("ModId");
                });

            modelBuilder.Entity("Website.Models.Database.Quote", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", "Contributor")
                        .WithMany()
                        .HasForeignKey("ContributorId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Website.Models.Database.Video", "Video")
                        .WithMany()
                        .HasForeignKey("VideoId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Website.Models.Database.SubmittedEpisode", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", "Contributor")
                        .WithMany()
                        .HasForeignKey("ContributorId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Website.Models.Database.Video", "Video")
                        .WithMany("Submissions")
                        .HasForeignKey("VideoId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Website.Models.Database.SubmittedEpisodeFlag", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", "FlaggedBy")
                        .WithMany()
                        .HasForeignKey("FlaggedById")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Website.Models.Database.SubmittedEpisode")
                        .WithMany("Flags")
                        .HasForeignKey("SubmittedEpisodeId");
                });

            modelBuilder.Entity("Website.Models.Database.Thumbnail", b =>
                {
                    b.HasOne("Website.Models.Database.Video")
                        .WithMany("Thumbnails")
                        .HasForeignKey("VideoId");
                });
#pragma warning restore 612, 618
        }
    }
}
