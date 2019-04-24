using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IFloorRepository
    {
        Task<string> SaveFloor(SaveFloor floor);
        Task<int> CountFloors();
        Task<int> DeleteFloor(string floorId);
        Task<Floor?> GetFloorById(string floorId, bool includeMod);
        Task<Floor?> GetFloorByName(string floorName, bool includeMod);
        Task<List<Floor>> GetAllFloors(bool includeMod);
    }
}
