using System.Collections.Generic;
using Website.Models.Database;

namespace Website.Models.Resource
{
    public class IsaacResourceOverview
    {
        public IsaacResourceOverview(Dictionary<string, List<IsaacResource>> resources)
        {
            Resources = resources;
        }

        public Dictionary<string, List<IsaacResource>> Resources { get; set; }
    }
}

