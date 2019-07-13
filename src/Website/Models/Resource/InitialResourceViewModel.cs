using Website.Models.Database;

namespace Website.Models.Resource
{
    public class InitialResourceViewModel
    {
        public InitialResourceViewModel(IsaacResource resource, NldbVideoResult videos)
        {
            IsaacResource = resource;
            Videos = videos;
        }

        public IsaacResource IsaacResource { get; set; }
        public NldbVideoResult Videos { get; set; }
    }
}
