using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;

namespace Website.Services
{
    public interface IDiscussionTopicsRepository
    {
        Task<int> Create(DiscussionTopic topic, string userId);
        Task<List<DiscussionTopic>> GetTopicsForVideo(string videoId);
    }
}
