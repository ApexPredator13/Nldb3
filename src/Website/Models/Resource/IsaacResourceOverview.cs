using System.Collections.Generic;
using Website.Models.Database;
using Website.Models.Database.Enums;

namespace Website.Models.Resource
{
    public class IsaacResourceOverview
    {
        public IsaacResourceOverview(Dictionary<string, List<IsaacResource>> resources, ResourceType resourceType)
        {
            Resources = resources;
            ResourceType = resourceType;
        }

        public Dictionary<string, List<IsaacResource>> Resources { get; set; }
        public ResourceType ResourceType { get; set; }
    }
}

