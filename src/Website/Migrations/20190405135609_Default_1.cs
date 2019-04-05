﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Website.Migrations
{
    public partial class Default_1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mods",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Videos",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Title = table.Column<string>(nullable: true),
                    RequiresUpdate = table.Column<bool>(nullable: false),
                    Likes = table.Column<int>(nullable: false),
                    Dislikes = table.Column<int>(nullable: false),
                    ViewCount = table.Column<int>(nullable: false),
                    FavouriteCount = table.Column<int>(nullable: false),
                    CommentCount = table.Column<int>(nullable: false),
                    Published = table.Column<DateTime>(nullable: false),
                    Duration = table.Column<TimeSpan>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModUrl",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Url = table.Column<string>(nullable: true),
                    LinkText = table.Column<string>(nullable: true),
                    ModId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModUrl", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModUrl_Mods_ModId",
                        column: x => x.ModId,
                        principalTable: "Mods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Quotes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    SecondsIn = table.Column<int>(nullable: false),
                    QuoteText = table.Column<string>(nullable: true),
                    Contributor = table.Column<Guid>(nullable: false),
                    SubmissionTime = table.Column<DateTime>(nullable: false),
                    VideoId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quotes_Videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Videos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubmittedEpisode",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    VideoId = table.Column<string>(nullable: true),
                    Contributor = table.Column<Guid>(nullable: false),
                    ContributedAt = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmittedEpisode", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubmittedEpisode_Videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Videos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Thumbnail",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Url = table.Column<string>(nullable: true),
                    Type = table.Column<string>(nullable: true),
                    Width = table.Column<int>(nullable: false),
                    Height = table.Column<int>(nullable: false),
                    VideoId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Thumbnail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Thumbnail_Videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Videos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GameplayEvent",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    EventType = table.Column<int>(nullable: false),
                    SubmittedEpisodeId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameplayEvent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameplayEvent_SubmittedEpisode_SubmittedEpisodeId",
                        column: x => x.SubmittedEpisodeId,
                        principalTable: "SubmittedEpisode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubmittedEpisodeFlag",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Reason = table.Column<int>(nullable: false),
                    FlaggedBy = table.Column<Guid>(nullable: false),
                    FlagTime = table.Column<DateTime>(nullable: false),
                    SubmittedEpisodeId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmittedEpisodeFlag", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubmittedEpisodeFlag_SubmittedEpisode_SubmittedEpisodeId",
                        column: x => x.SubmittedEpisodeId,
                        principalTable: "SubmittedEpisode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "IsaacResources",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    Color = table.Column<string>(nullable: true),
                    ExistsIn = table.Column<int>(nullable: false),
                    X = table.Column<int>(nullable: false),
                    Y = table.Column<int>(nullable: false),
                    FromModId = table.Column<int>(nullable: true),
                    Type = table.Column<int>(nullable: false),
                    ChallengeSpecificId = table.Column<string>(nullable: true),
                    AvailableIn = table.Column<int>(nullable: false),
                    GameplayEventId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IsaacResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IsaacResources_IsaacResources_ChallengeSpecificId",
                        column: x => x.ChallengeSpecificId,
                        principalTable: "IsaacResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IsaacResources_Mods_FromModId",
                        column: x => x.FromModId,
                        principalTable: "Mods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IsaacResources_GameplayEvent_GameplayEventId",
                        column: x => x.GameplayEventId,
                        principalTable: "GameplayEvent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Description",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Text = table.Column<string>(nullable: true),
                    ValidFor = table.Column<int>(nullable: false),
                    IsaacResourceId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Description", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Description_IsaacResources_IsaacResourceId",
                        column: x => x.IsaacResourceId,
                        principalTable: "IsaacResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "IsaacEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Effect = table.Column<int>(nullable: false),
                    IsaacResourceId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IsaacEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IsaacEffects_IsaacResources_IsaacResourceId",
                        column: x => x.IsaacResourceId,
                        principalTable: "IsaacResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Description_IsaacResourceId",
                table: "Description",
                column: "IsaacResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_GameplayEvent_SubmittedEpisodeId",
                table: "GameplayEvent",
                column: "SubmittedEpisodeId");

            migrationBuilder.CreateIndex(
                name: "IX_IsaacEffects_IsaacResourceId",
                table: "IsaacEffects",
                column: "IsaacResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_IsaacResources_ChallengeSpecificId",
                table: "IsaacResources",
                column: "ChallengeSpecificId");

            migrationBuilder.CreateIndex(
                name: "IX_IsaacResources_FromModId",
                table: "IsaacResources",
                column: "FromModId");

            migrationBuilder.CreateIndex(
                name: "IX_IsaacResources_GameplayEventId",
                table: "IsaacResources",
                column: "GameplayEventId");

            migrationBuilder.CreateIndex(
                name: "IX_ModUrl_ModId",
                table: "ModUrl",
                column: "ModId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_VideoId",
                table: "Quotes",
                column: "VideoId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmittedEpisode_VideoId",
                table: "SubmittedEpisode",
                column: "VideoId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmittedEpisodeFlag_SubmittedEpisodeId",
                table: "SubmittedEpisodeFlag",
                column: "SubmittedEpisodeId");

            migrationBuilder.CreateIndex(
                name: "IX_Thumbnail_VideoId",
                table: "Thumbnail",
                column: "VideoId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Description");

            migrationBuilder.DropTable(
                name: "IsaacEffects");

            migrationBuilder.DropTable(
                name: "ModUrl");

            migrationBuilder.DropTable(
                name: "Quotes");

            migrationBuilder.DropTable(
                name: "SubmittedEpisodeFlag");

            migrationBuilder.DropTable(
                name: "Thumbnail");

            migrationBuilder.DropTable(
                name: "IsaacResources");

            migrationBuilder.DropTable(
                name: "Mods");

            migrationBuilder.DropTable(
                name: "GameplayEvent");

            migrationBuilder.DropTable(
                name: "SubmittedEpisode");

            migrationBuilder.DropTable(
                name: "Videos");
        }
    }
}