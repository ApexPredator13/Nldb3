using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IFloorRepository
    {
        Task SaveFloor(SaveFloor boss);
        Task<int> CountFloors();
    }
}
