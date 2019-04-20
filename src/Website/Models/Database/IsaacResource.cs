using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class IsaacResource
    {
        [Key]
        public string Id { get; set; }

        [Key]
        public ResourceType Type { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public ExistsIn ExistsIn { get; set; }

        [Required]
        public int X { get; set; }

        [Required]
        public int Y { get; set; }

        [Required]
        public int W { get; set; }

        [Required]
        public GameMode AvailableIn { get; set; }

        [StringLength(8)]
        public string Color { get; set; }

        public Mod FromMod { get; set; }
        public List<Description> Descriptions { get; set; }
        public IsaacResource ChallengeSpecific { get; set; }
        public List<IsaacResourceTag> Tags { get; set; }
    }
}


