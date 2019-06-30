using Newtonsoft.Json;

namespace Website.Models.Resource
{
    public class DataSet
    {
        public DataSet(int numberOfDatapoints, string label)
        {
            Label = label;
            Data = new int[numberOfDatapoints];
            BackgroundColor = new string[numberOfDatapoints];
            BorderColor = new string[numberOfDatapoints];
            BorderWidth = 1;
        }

        [JsonProperty("label")]
        public string Label { get; set; }

        [JsonProperty("data")]
        public int[] Data { get; set; }

        [JsonProperty("backgroundColor")]
        public string[] BackgroundColor { get; set; }

        [JsonProperty("borderColor")]
        public string[] BorderColor { get; set; }

        [JsonProperty("borderWidth")]
        public int BorderWidth { get; set; }
    }
}
