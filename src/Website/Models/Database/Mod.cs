using System.Collections.Generic;

namespace Website.Models.Database
{
    public class Mod
    {
        public int Id { get; set; } = 0;

        public string ModName { get; set; } = string.Empty;

        public List<ModUrl> ModUrls { get; set; } = new List<ModUrl>();
    }
}
