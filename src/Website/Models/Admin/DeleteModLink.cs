using System.ComponentModel.DataAnnotations;

namespace Website.Models.Admin
{
    public class DeleteModLink
    {
        [Required]
        public int? LinkId { get; set; }
    }
}
