using Newtonsoft.Json;
using System.Collections.Generic;

namespace Website.Models.Resource
{
    public class ChartObject
    {
        public ChartObject(List<string> labels, List<DataSet> dataSets)
        {
            DataSets = dataSets;
            Labels = labels;
        }

        [JsonProperty("labels")]
        public List<string> Labels { get; set; }

        [JsonProperty("datasets")]
        public List<DataSet> DataSets { get; set; }
    }
}
