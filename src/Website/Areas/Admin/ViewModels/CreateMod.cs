using System.ComponentModel.DataAnnotations;

namespace Website.Areas.Admin.ViewModels
{
    public class CreateMod
    {
        public CreateMod()
        {
            ModName = string.Empty;
        }

        public CreateMod(string modName)
        {
            ModName = modName;
        }

        [Required]
        [StringLength(256)]
        public string ModName { get; set; }
    }
}
