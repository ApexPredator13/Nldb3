using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class EncounteredTrinket
    {
        public int Id { get; set; }
        public IsaacResource Trinket { get; set; }
        public ItemUsage ItemUsage { get; set; }
    }
}
