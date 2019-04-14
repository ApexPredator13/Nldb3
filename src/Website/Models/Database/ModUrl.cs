using System.ComponentModel.DataAnnotations;

#nullable disable
namespace Website.Models.Database
{
    public class ModUrl
    {
        public int Id { get; set; }

        [Required]
        public string Url { get; set; }

        [Required]
        public string LinkText { get; set; }
    }
}
