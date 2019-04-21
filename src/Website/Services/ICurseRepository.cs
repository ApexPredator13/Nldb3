using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface ICurseRepository
    {
        Task SaveCurse(SaveCurse newCurse);
        Task<int> CountCurses();
    }
}
