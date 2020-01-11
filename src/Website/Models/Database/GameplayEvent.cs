using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class GameplayEvent
    {
        [JsonProperty("id")]
        public int Id { get; set; } = 0;

        [JsonProperty("event_type")]
        public GameplayEventType EventType { get; set; } = GameplayEventType.Unspecified;

        [JsonProperty("r1")]
        public IsaacResource Resource1 { get; set; } = new IsaacResource();

        [JsonProperty("r2")]
        public IsaacResource? Resource2 { get; set; } = null;

        [JsonProperty("r3")]
        public int? Resource3 { get; set; } = null;

        [JsonProperty("action")]
        public int Action { get; set; } = 0;

        [JsonProperty("in_consequence_of")]
        public IsaacResource? InConsequenceOf { get; set; } = null;

        [JsonProperty("run_number")]
        public int RunNumber { get; set; } = 0;

        [JsonProperty("player")]
        public int? Player { get; set; } = null;

        [JsonProperty("floor_number")]
        public int FloorNumber { get; set; } = 0;

        [JsonProperty("submission")]
        public int Submission { get; set; } = 0;

        [JsonProperty("was_rerolled")]
        public bool WasRerolled { get; set; } = false;

        [JsonProperty("played_character")]
        public int PlayedCharacterId { get; set; }

        [JsonProperty("played_floor")]
        public int PlayedFloorId { get; set; }

        [JsonProperty("latest")]
        public bool Latest { get; set; } = false;
    }
}
