using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface ICharacterRepository
    {
        Task SaveCharacter(SaveCharacter character);
    }
}
