using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IThreatRepository
    {
        Task SaveThreat(SaveThreat newThreat);
        Task<int> CountThreats();
    }
}
