using Website.Models.Database;

namespace Website.Models.Resource
{
    public class ResourceViewModel
    {
        public ResourceViewModel(DataSet[] graphBars, IsaacResource isaacResource)
        {
            GraphBars = graphBars;
            IsaacResource = isaacResource;
        }

        public DataSet[] GraphBars { get; set; }
        public IsaacResource IsaacResource { get; set; }
    }
}
