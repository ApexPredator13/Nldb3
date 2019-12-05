using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Models.Admin
{
    public class IncrementActionNumberAfterEventWithId
    {
        [Required]
        public int SubmissionId { get; set; }

        [Required]
        public int EventId { get; set; }

        public int IncrementByAmount { get; set; } = 1;
    }
}
