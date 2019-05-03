using System.ComponentModel.DataAnnotations;

namespace Website.Models.Database
{
    public class Thumbnail
    {
        public int Id { get; set; } = 0;

        [Required]
        public string Url { get; set; } = string.Empty;

        [Required]
        public int? Width { get; set; } = null;

        [Required]
        public int? Height { get; set; } = null;
    }
}
