using System.ComponentModel.DataAnnotations;

#nullable disable
namespace Website.Models.Database
{
    public class Thumbnail
    {
        public int Id { get; set; }

        [Required]
        public string Url { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public int Width { get; set; }

        [Required]
        public int Height { get; set; }
    }
}
