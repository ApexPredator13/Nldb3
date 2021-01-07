using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations.PersistedGrantDb
{
    public partial class PersistedGrantDbContext_2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ConsumedTime",
                schema: "identity",
                table: "PersistedGrants",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "identity",
                table: "PersistedGrants",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                schema: "identity",
                table: "PersistedGrants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "identity",
                table: "DeviceCodes",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                schema: "identity",
                table: "DeviceCodes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersistedGrants_SubjectId_SessionId_Type",
                schema: "identity",
                table: "PersistedGrants",
                columns: new[] { "SubjectId", "SessionId", "Type" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PersistedGrants_SubjectId_SessionId_Type",
                schema: "identity",
                table: "PersistedGrants");

            migrationBuilder.DropColumn(
                name: "ConsumedTime",
                schema: "identity",
                table: "PersistedGrants");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "identity",
                table: "PersistedGrants");

            migrationBuilder.DropColumn(
                name: "SessionId",
                schema: "identity",
                table: "PersistedGrants");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "identity",
                table: "DeviceCodes");

            migrationBuilder.DropColumn(
                name: "SessionId",
                schema: "identity",
                table: "DeviceCodes");
        }
    }
}
