using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.SubmitEpisode;
using Website.Services;
using Website.Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace Website.Areas.Api.Controllers
{
    [ApiController, Area("api"), Route("[area]/quotes")]
    public class QuoteController : Controller
    {
        private readonly IQuoteRepository _quoteRepository;
        private readonly UserManager<IdentityUser> _userManager;

        public QuoteController(IQuoteRepository quoteRepository, UserManager<IdentityUser> userManager)
        {
            _quoteRepository = quoteRepository;
            _userManager = userManager;
        }

        [Route("{id}")]
        public async Task<List<Quote>> ForVideo([FromRoute] string id)
        {
            string? userId = User.Identity.IsAuthenticated ? _userManager.GetUserId(User) : null;
            var quotes = await _quoteRepository.GetQuotesForVideo(id, userId);
            return quotes;
        }

        [Route("vote"), Authorize, HttpPost]
        public async Task<OkResult> Vote([FromBody] SubmittedQuoteVote vote)
        {
            await _quoteRepository.Vote(vote, _userManager.GetUserId(User));
            return Ok();
        }
    }
}
