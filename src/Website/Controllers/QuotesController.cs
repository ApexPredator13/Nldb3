using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Quote;
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


        [HttpGet, Authorize, Route("user")]
        public async Task<ActionResult<List<Quote>>> UserQuotes()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                return Unauthorized();
            }

            return await _quoteRepository.GetQuotesForUser(user.Id);
        }

        [HttpGet, Route("single/{id:int}")]
        public async Task<ActionResult<Quote>> GetSingleQuote([FromRoute] int id)
        {
            var user = await _userManager.GetUserAsync(User);
            var quote = await _quoteRepository.GetQuoteById(id, user.Id);

            if (quote is null)
            {
                return NotFound();
            }
            else
            {
                return quote;
            }
        }

        [HttpPost("update"), Authorize]
        public async Task<ActionResult<Quote?>> UpdateQuote([FromForm] UpdateQuote updateQuote)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var user = await _userManager.GetUserAsync(User);

            if (!await _quoteRepository.UserSubmittedQuote(updateQuote.Id ?? -1, user.Id))
            {
                return Unauthorized();
            }

            var result = await _quoteRepository.UpdateQuote(updateQuote, user.Id);

            if (result is 0)
            {
                return BadRequest("Quote could not be updated");
            }
            else
            {
                return await _quoteRepository.GetQuoteById(updateQuote.Id ?? -1, user.Id);
            }
        }

        [HttpDelete("{quoteId:int}"), Authorize]
        public async Task<ActionResult> Delete([FromRoute] int quoteId)
        {
            var user = await _userManager.GetUserAsync(User);

            if (!await _quoteRepository.UserSubmittedQuote(quoteId, user.Id))
            {
                return Unauthorized();
            }

            var result = await _quoteRepository.DeleteQuote(quoteId, user.Id);

            if (result > 0)
            {
                return Ok();
            } 
            else
            {
                return BadRequest("Quote could not be deleted.");
            }
        }
    }
}



