using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface ITransformationRepository
    {
        Task SaveTransformation(SaveTransformation newTransformation);
    }
}
