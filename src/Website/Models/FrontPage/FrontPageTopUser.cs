using Newtonsoft.Json;

namespace Website.Models.FrontPage
{
    public class FrontPageTopUser
    {
        public FrontPageTopUser(string username, int contributions)
        {
            Username = username;
            Contributions = contributions;
        }

        [JsonProperty("name")]
        public string Username { get; set; } = string.Empty;

        [JsonProperty("contributions")]
        public int Contributions { get; set; } = 0;
    }
}
