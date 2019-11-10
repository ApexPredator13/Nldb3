using Newtonsoft.Json;
using System.Collections.Generic;

namespace Website.Models.Database
{
    public class PlayedFloor
    {
        [JsonProperty("id")]
        public int Id { get; set; } = 0;

        [JsonProperty("floor")]
        public IsaacResource Floor { get; set; } = new IsaacResource();

        [JsonProperty("action")]
        public int Action { get; set; } = 0;

        [JsonProperty("run_number")]
        public int RunNumber { get; set; } = 0;

        [JsonProperty("floor_number")]
        public int FloorNumber { get; set; } = 0;

        [JsonProperty("died_from")]
        public IsaacResource? DiedFrom { get; set; } = null;

        [JsonProperty("events")]
        public List<GameplayEvent> GameplayEvents { get; set; } = new List<GameplayEvent>();

        [JsonProperty("submission")]
        public int Submission { get; set; }

        [JsonProperty("duration")]
        public int Duration { get; set; }
    }
}
