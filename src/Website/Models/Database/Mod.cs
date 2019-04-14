using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

#nullable disable
namespace Website.Models.Database
{
    public class Mod
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public List<ModUrl> ModUrls { get; set; }
    }
}
