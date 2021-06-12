using Newtonsoft.Json;
using System.Collections.Generic;
using Website.Models.Database.Enums;

namespace Website.Models.Database
{
    public class PlayedCharacter
    {
        [JsonProperty("id")]
        public int Id { get; set; } = 0;

        [JsonProperty("character")]
        public IsaacResource GameCharacter { get; set; } = new IsaacResource();

        [JsonProperty("action")]
        public int Action { get; set; } = 0;

        [JsonProperty("run_number")]
        public int RunNumber { get; set; } = 0;

        [JsonProperty("died_from")]
        public IsaacResource? DiedFrom { get; set; } = null;

        [JsonProperty("played_floors")]
        public List<PlayedFloor> PlayedFloors { get; set; } = new List<PlayedFloor>();

        [JsonProperty("submission")]
        public int Submission { get; set; } = 0;

        [JsonProperty("seed")]
        public string? Seed { get; set; }

        [JsonProperty("game_mode")]
        public GameMode GameMode { get; set; }
    }
}
