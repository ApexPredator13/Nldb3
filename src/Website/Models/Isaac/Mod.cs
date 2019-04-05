using System.Collections.Generic;

namespace Website.Models.Isaac
{
    public class Mod
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<ModUrl> ModUrls { get; set; }
    }
}
