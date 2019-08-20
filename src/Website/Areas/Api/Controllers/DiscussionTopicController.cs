using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Services;
using Website.Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace Website.Areas.Api.Controllers
{
    [Area("api"), Route("[area]/topics"), ApiController]
    public class DiscussionTopicController : Controller
    {
        private readonly IDiscussionTopicsRepository _discussionTopicRepository;
        private readonly UserManager<IdentityUser> _userManager;

        public DiscussionTopicController(IDiscussionTopicsRepository discussionTopicRepository, UserManager<IdentityUser> userManager)
        {
            _discussionTopicRepository = discussionTopicRepository;
            _userManager = userManager;
        }

        [HttpPost, Authorize]
        public async Task<ActionResult> Post(DiscussionTopic topic)
        {
            var userId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            await _discussionTopicRepository.Create(topic, userId);
            return Ok();
        }
    }
}
