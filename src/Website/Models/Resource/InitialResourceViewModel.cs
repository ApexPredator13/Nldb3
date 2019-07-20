using System.Collections.Generic;
using Website.Models.Database;
using Website.Models.Database.Enums;

namespace Website.Models.Resource
{
    public class InitialResourceViewModel
    {
        public InitialResourceViewModel(IsaacResource resource, NldbVideoResult videos, List<AvailableStats> availableStats)
        {
            IsaacResource = resource;
            Videos = videos;
            AvailableStats = availableStats;
        }

        public IsaacResource IsaacResource { get; set; }
        public NldbVideoResult Videos { get; set; }
        public List<AvailableStats> AvailableStats { get; set; }
    }
}
