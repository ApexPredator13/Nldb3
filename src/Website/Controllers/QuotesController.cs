using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Controllers
{
    [ApiController, Route("Api/Quotes")]
    public class QuotesController : Controller
    {
        private readonly IQuoteRepository _quoteRepository;
        private readonly UserManager<IdentityUser> _userManager;

        public QuotesController(IQuoteRepository quoteRepository, UserManager<IdentityUser> userManager)
        {
            _quoteRepository = quoteRepository;
            _userManager = userManager;
        }

        [HttpPost, Authorize]
        public async Task<ActionResult> CreateQuote([FromForm] SubmittedQuote quote)
        {
            var userId = _userManager.GetUserId(User);
            var userCanCreateQuote = await _quoteRepository.UserCanCreateQuote(userId);

            if (!userCanCreateQuote)
            {
                return BadRequest("A quote can only be submitted every 15 seconds");
            }

            var quoteInsertChanges = await _quoteRepository.SaveQuote(quote, userId);
            if (quoteInsertChanges > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("The quote was not saved successfully. Please try again.");
            }
        }
    }
}
