using Website.Models.Isaac.Enums;

namespace Website.Models.Isaac
{
    public class Description
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public ExistsIn ValidFor { get; set; }
    }
}
