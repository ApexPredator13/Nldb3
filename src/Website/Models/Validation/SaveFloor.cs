namespace Website.Models.Validation
{
    public class SaveFloor : SaveIsaacResource
    {
        public int DisplayOrder { get; set; } = 0;
        public int Difficulty { get; set; } = 0;
    }
}
