using System.Collections.Generic;

namespace Website.Models.PartialViews
{
    public class ResourceSelectionTextonly
    {
        public ResourceSelectionTextonly(string selectionId, List<(string name, int value)> selectionElements)
        {
            IsaacResources = selectionElements;
            SelectionId = selectionId;
        }

        public List<(string name, int value)> IsaacResources { get; set; } = new List<(string name, int value)>();
        public string SelectionId { get; set; } = string.Empty;
    }
}
