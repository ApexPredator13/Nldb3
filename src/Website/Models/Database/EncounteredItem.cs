using Website.Models.Database.Enums;

#nullable disable
namespace Website.Models.Database
{
    public class EncounteredItem
    {
        public int Id { get; set; }
        public IsaacResource Item { get; set; }
        public IsaacResource ItemSource { get; set; }
        public ItemUsage ItemUsage { get; set; }
    }
}
