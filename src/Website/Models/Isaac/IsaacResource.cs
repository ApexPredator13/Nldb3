using System.Collections.Generic;
using Website.Models.Isaac.Enums;

namespace Website.Models.Isaac
{
    public class IsaacResource
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Color { get; set; }
        public ExistsIn ExistsIn { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public Mod FromMod { get; set; }
        public ResourceType Type { get; set; }
        public List<Description> Descriptions { get; set; }
        public IsaacResource ChallengeSpecific { get; set; }
        public GameMode AvailableIn { get; set; }
        public List<IsaacResourceTag> Tags { get; set; }
    }
}


