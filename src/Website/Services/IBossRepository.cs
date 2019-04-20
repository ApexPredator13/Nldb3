using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IBossRepository
    {
        Task SaveBoss(SaveBoss boss);
    }
}
