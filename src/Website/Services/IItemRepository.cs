using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IItemRepository
    {
        Task SaveItem(SaveItem item);
        Task<int> CountItems();
        Task<string?> GetTransformationForItem(string itemId);
    }
}
