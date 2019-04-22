using System.ComponentModel.DataAnnotations;

namespace Website.Models.Validation
{
    public class SaveMod
    {
        public SaveMod()
        {
            ModName = string.Empty;
        }

        public SaveMod(string modName)
        {
            ModName = modName;
        }

        [Required]
        public string ModName { get; set; }
    }
}
