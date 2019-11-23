using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.SubmitEpisode;
using Website.Services;
using Microsoft.AspNetCore.Identity;

namespace Website.Areas.Api.Controllers
{
    [Area("api"), Route("[area]/quotes")]
    public class QuoteController : Controller
    {
        private readonly IQuoteRepository _quoteRepository;
        private readonly UserManager<IdentityUser> _userManager;

        public QuoteController(IQuoteRepository quoteRepository, UserManager<IdentityUser> userManager)
        {
            _quoteRepository = quoteRepository;
            _userManager = userManager;
        }

        [HttpGet, Route("{id}")]
        public async Task<List<Quote>> ForVideo([FromRoute] string id)
        {
            string? userId = User.Identity.IsAuthenticated ? _userManager.GetUserId(User) : null;
            var quotes = await _quoteRepository.GetQuotesForVideo(id, userId);
            return quotes;
        }

        [Route("vote"), Authorize, HttpPost]
        public async Task<OkResult> Vote([FromBody] SubmittedQuoteVote vote)
        {
            await _quoteRepository.Vote(vote, _userManager.GetUserId(HttpContext.User));
            return Ok();
        }

        [HttpGet, Route("random/{amount:int}")]
        public async Task<List<Quote>> GetRandomQuotes([FromRoute] int amount)
        {
            string? userId = User.Identity.IsAuthenticated ? _userManager.GetUserId(User) : null;
            return await _quoteRepository.RandomQuotes(amount, userId);
        }

        [HttpGet, Route("recent/{amount:int}")]
        public async Task<List<Quote>> GetNewestQuotes([FromRoute] int amount)
        {
            string? userId = User.Identity.IsAuthenticated ? _userManager.GetUserId(User) : null;
            return await _quoteRepository.NewestQuotes(amount, userId);
        }

        [HttpGet, Route("search")]
        public async Task<List<Quote>> SearchQuoteText([FromQuery] string text)
        {
            string? userId = User.Identity.IsAuthenticated ? _userManager.GetUserId(User) : null;
            return await _quoteRepository.Search(text, userId);
        }

        //[HttpPost, Authorize]
        //public async Task<ActionResult> CreateQuote([FromBody] SubmittedQuote quote)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest("Invalid request.");
        //    }

        //    var userId = _userManager.GetUserId(User);
        //    var userCanCreateQuote = await _quoteRepository.UserCanCreateQuote(userId);

        //    if (!userCanCreateQuote)
        //    {
        //        return BadRequest("A quote can only be submitted every 15 seconds");
        //    }

        //    var quoteInsertChanges = await _quoteRepository.SaveQuote(quote, userId);
        //    if (quoteInsertChanges > 0)
        //    {
        //        return Ok();
        //    }
        //    else
        //    {
        //        return BadRequest("The quote was not saved successfully. Please try again.");
        //    }
        //}
    }
}


