using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Areas.Api.Models
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
