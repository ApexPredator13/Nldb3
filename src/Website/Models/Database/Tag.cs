using Newtonsoft.Json;
using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class Tag
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("effect")]
        public Effect Effect { get; set; }
    }
}
