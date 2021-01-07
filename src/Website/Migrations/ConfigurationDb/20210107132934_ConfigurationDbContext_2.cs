using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Website.Migrations.ConfigurationDb
{
    public partial class ConfigurationDbContext_2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApiClaims_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_ApiProperties_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiProperties");

            migrationBuilder.DropForeignKey(
                name: "FK_ApiScopeClaims_ApiScopes_ApiScopeId",
                schema: "identity",
                table: "ApiScopeClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_ApiScopes_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiScopes");

            migrationBuilder.DropForeignKey(
                name: "FK_IdentityProperties_IdentityResources_IdentityResourceId",
                schema: "identity",
                table: "IdentityProperties");

            migrationBuilder.DropTable(
                name: "ApiSecrets",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "IdentityClaims",
                schema: "identity");

            migrationBuilder.DropIndex(
                name: "IX_ApiScopes_ApiResourceId",
                schema: "identity",
                table: "ApiScopes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IdentityProperties",
                schema: "identity",
                table: "IdentityProperties");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApiProperties",
                schema: "identity",
                table: "ApiProperties");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApiClaims",
                schema: "identity",
                table: "ApiClaims");

            migrationBuilder.DropColumn(
                name: "ApiResourceId",
                schema: "identity",
                table: "ApiScopes");

            migrationBuilder.RenameTable(
                name: "IdentityProperties",
                schema: "identity",
                newName: "IdentityResourceProperties",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "ApiProperties",
                schema: "identity",
                newName: "ApiResourceProperties",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "ApiClaims",
                schema: "identity",
                newName: "ApiResourceClaims",
                newSchema: "identity");

            migrationBuilder.RenameColumn(
                name: "ApiScopeId",
                schema: "identity",
                table: "ApiScopeClaims",
                newName: "ScopeId");

            migrationBuilder.RenameIndex(
                name: "IX_ApiScopeClaims_ApiScopeId",
                schema: "identity",
                table: "ApiScopeClaims",
                newName: "IX_ApiScopeClaims_ScopeId");

            migrationBuilder.RenameIndex(
                name: "IX_IdentityProperties_IdentityResourceId",
                schema: "identity",
                table: "IdentityResourceProperties",
                newName: "IX_IdentityResourceProperties_IdentityResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_ApiProperties_ApiResourceId",
                schema: "identity",
                table: "ApiResourceProperties",
                newName: "IX_ApiResourceProperties_ApiResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_ApiClaims_ApiResourceId",
                schema: "identity",
                table: "ApiResourceClaims",
                newName: "IX_ApiResourceClaims_ApiResourceId");

            migrationBuilder.AddColumn<string>(
                name: "AllowedIdentityTokenSigningAlgorithms",
                schema: "identity",
                table: "Clients",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequireRequestObject",
                schema: "identity",
                table: "Clients",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Enabled",
                schema: "identity",
                table: "ApiScopes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AllowedAccessTokenSigningAlgorithms",
                schema: "identity",
                table: "ApiResources",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowInDiscoveryDocument",
                schema: "identity",
                table: "ApiResources",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_IdentityResourceProperties",
                schema: "identity",
                table: "IdentityResourceProperties",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApiResourceProperties",
                schema: "identity",
                table: "ApiResourceProperties",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApiResourceClaims",
                schema: "identity",
                table: "ApiResourceClaims",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ApiResourceScopes",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Scope = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ApiResourceId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiResourceScopes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiResourceScopes_ApiResources_ApiResourceId",
                        column: x => x.ApiResourceId,
                        principalSchema: "identity",
                        principalTable: "ApiResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApiResourceSecrets",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiResourceId = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Value = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Expiration = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Type = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiResourceSecrets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiResourceSecrets_ApiResources_ApiResourceId",
                        column: x => x.ApiResourceId,
                        principalSchema: "identity",
                        principalTable: "ApiResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApiScopeProperties",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ScopeId = table.Column<int>(type: "integer", nullable: false),
                    Key = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Value = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiScopeProperties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiScopeProperties_ApiScopes_ScopeId",
                        column: x => x.ScopeId,
                        principalSchema: "identity",
                        principalTable: "ApiScopes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IdentityResourceClaims",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdentityResourceId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdentityResourceClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IdentityResourceClaims_IdentityResources_IdentityResourceId",
                        column: x => x.IdentityResourceId,
                        principalSchema: "identity",
                        principalTable: "IdentityResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApiResourceScopes_ApiResourceId",
                schema: "identity",
                table: "ApiResourceScopes",
                column: "ApiResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiResourceSecrets_ApiResourceId",
                schema: "identity",
                table: "ApiResourceSecrets",
                column: "ApiResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiScopeProperties_ScopeId",
                schema: "identity",
                table: "ApiScopeProperties",
                column: "ScopeId");

            migrationBuilder.CreateIndex(
                name: "IX_IdentityResourceClaims_IdentityResourceId",
                schema: "identity",
                table: "IdentityResourceClaims",
                column: "IdentityResourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApiResourceClaims_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiResourceClaims",
                column: "ApiResourceId",
                principalSchema: "identity",
                principalTable: "ApiResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiResourceProperties_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiResourceProperties",
                column: "ApiResourceId",
                principalSchema: "identity",
                principalTable: "ApiResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiScopeClaims_ApiScopes_ScopeId",
                schema: "identity",
                table: "ApiScopeClaims",
                column: "ScopeId",
                principalSchema: "identity",
                principalTable: "ApiScopes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_IdentityResourceProperties_IdentityResources_IdentityResour~",
                schema: "identity",
                table: "IdentityResourceProperties",
                column: "IdentityResourceId",
                principalSchema: "identity",
                principalTable: "IdentityResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApiResourceClaims_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiResourceClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_ApiResourceProperties_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiResourceProperties");

            migrationBuilder.DropForeignKey(
                name: "FK_ApiScopeClaims_ApiScopes_ScopeId",
                schema: "identity",
                table: "ApiScopeClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_IdentityResourceProperties_IdentityResources_IdentityResour~",
                schema: "identity",
                table: "IdentityResourceProperties");

            migrationBuilder.DropTable(
                name: "ApiResourceScopes",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "ApiResourceSecrets",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "ApiScopeProperties",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "IdentityResourceClaims",
                schema: "identity");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IdentityResourceProperties",
                schema: "identity",
                table: "IdentityResourceProperties");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApiResourceProperties",
                schema: "identity",
                table: "ApiResourceProperties");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApiResourceClaims",
                schema: "identity",
                table: "ApiResourceClaims");

            migrationBuilder.DropColumn(
                name: "AllowedIdentityTokenSigningAlgorithms",
                schema: "identity",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "RequireRequestObject",
                schema: "identity",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Enabled",
                schema: "identity",
                table: "ApiScopes");

            migrationBuilder.DropColumn(
                name: "AllowedAccessTokenSigningAlgorithms",
                schema: "identity",
                table: "ApiResources");

            migrationBuilder.DropColumn(
                name: "ShowInDiscoveryDocument",
                schema: "identity",
                table: "ApiResources");

            migrationBuilder.RenameTable(
                name: "IdentityResourceProperties",
                schema: "identity",
                newName: "IdentityProperties",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "ApiResourceProperties",
                schema: "identity",
                newName: "ApiProperties",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "ApiResourceClaims",
                schema: "identity",
                newName: "ApiClaims",
                newSchema: "identity");

            migrationBuilder.RenameColumn(
                name: "ScopeId",
                schema: "identity",
                table: "ApiScopeClaims",
                newName: "ApiScopeId");

            migrationBuilder.RenameIndex(
                name: "IX_ApiScopeClaims_ScopeId",
                schema: "identity",
                table: "ApiScopeClaims",
                newName: "IX_ApiScopeClaims_ApiScopeId");

            migrationBuilder.RenameIndex(
                name: "IX_IdentityResourceProperties_IdentityResourceId",
                schema: "identity",
                table: "IdentityProperties",
                newName: "IX_IdentityProperties_IdentityResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_ApiResourceProperties_ApiResourceId",
                schema: "identity",
                table: "ApiProperties",
                newName: "IX_ApiProperties_ApiResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_ApiResourceClaims_ApiResourceId",
                schema: "identity",
                table: "ApiClaims",
                newName: "IX_ApiClaims_ApiResourceId");

            migrationBuilder.AddColumn<int>(
                name: "ApiResourceId",
                schema: "identity",
                table: "ApiScopes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_IdentityProperties",
                schema: "identity",
                table: "IdentityProperties",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApiProperties",
                schema: "identity",
                table: "ApiProperties",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApiClaims",
                schema: "identity",
                table: "ApiClaims",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ApiSecrets",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiResourceId = table.Column<int>(type: "integer", nullable: false),
                    Created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Expiration = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Type = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Value = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiSecrets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiSecrets_ApiResources_ApiResourceId",
                        column: x => x.ApiResourceId,
                        principalSchema: "identity",
                        principalTable: "ApiResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IdentityClaims",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdentityResourceId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdentityClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IdentityClaims_IdentityResources_IdentityResourceId",
                        column: x => x.IdentityResourceId,
                        principalSchema: "identity",
                        principalTable: "IdentityResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApiScopes_ApiResourceId",
                schema: "identity",
                table: "ApiScopes",
                column: "ApiResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiSecrets_ApiResourceId",
                schema: "identity",
                table: "ApiSecrets",
                column: "ApiResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_IdentityClaims_IdentityResourceId",
                schema: "identity",
                table: "IdentityClaims",
                column: "IdentityResourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApiClaims_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiClaims",
                column: "ApiResourceId",
                principalSchema: "identity",
                principalTable: "ApiResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiProperties_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiProperties",
                column: "ApiResourceId",
                principalSchema: "identity",
                principalTable: "ApiResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiScopeClaims_ApiScopes_ApiScopeId",
                schema: "identity",
                table: "ApiScopeClaims",
                column: "ApiScopeId",
                principalSchema: "identity",
                principalTable: "ApiScopes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiScopes_ApiResources_ApiResourceId",
                schema: "identity",
                table: "ApiScopes",
                column: "ApiResourceId",
                principalSchema: "identity",
                principalTable: "ApiResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_IdentityProperties_IdentityResources_IdentityResourceId",
                schema: "identity",
                table: "IdentityProperties",
                column: "IdentityResourceId",
                principalSchema: "identity",
                principalTable: "IdentityResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
