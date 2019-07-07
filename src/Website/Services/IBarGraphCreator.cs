using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models;
using Website.Models.Database;
using Website.Models.Resource;

namespace Website.Services
{
    public interface IBarGraphCreator
    {
        Task<ChartObject> ThroughoutTheLetsPlay(string name, List<DateTime> timestamps, IsaacResourceSearchOptions searchOptions);
        ChartObject IsaacResourceRanking(string label, List<(int amount, IsaacResource foundAt)> data);
    }
}
