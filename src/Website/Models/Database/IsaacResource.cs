using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class IsaacResource
    {
        public string Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public ExistsIn ExistsIn { get; set; }

        [Required]
        public int X { get; set; }

        [Required]
        public int Y { get; set; }

        [Required]
        public ResourceType Type { get; set; }

        [Required]
        public GameMode AvailableIn { get; set; }

        public Mod FromMod { get; set; }
        public string Color { get; set; }
        public List<Description> Descriptions { get; set; }
        public IsaacResource ChallengeSpecific { get; set; }
        public List<IsaacResourceTag> Tags { get; set; }
    }
}


