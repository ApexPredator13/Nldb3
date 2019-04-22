namespace Website.Models.Validation
{
    public class SaveItem : SaveIsaacResource
    {
        public string? TransformationId { get; set; }
        public bool CountsMultipleTimes { get; set; }
    }
}
