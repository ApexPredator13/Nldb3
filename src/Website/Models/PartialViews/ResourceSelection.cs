using System.Collections.Generic;
using Website.Models.Database;

namespace Website.Models.PartialViews
{
    public class ResourceSelection
    {
        public ResourceSelection(string selectionId, List<IsaacResource> selectionElements)
        {
            IsaacResources = selectionElements;
            SelectionId = selectionId;
        }

        public List<IsaacResource> IsaacResources { get; set; } = new List<IsaacResource>();
        public string SelectionId { get; set; } = string.Empty;
    }
}
