using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IItemsourceRepository
    {
        Task SaveItemsource(SaveItemsource newItemsource);
        Task<int> CountItemsources();
    }
}
