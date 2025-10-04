using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StdFrase.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActivityOrder",
                table: "Activities",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityOrder",
                table: "Activities");
        }
    }
}
