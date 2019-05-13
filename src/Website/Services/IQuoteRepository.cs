using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.SubmitEpisode;

namespace Website.Services
{
    public interface IQuoteRepository
    {
        Task<int> SaveQuote(SubmittedQuote quote, string userId);
        Task<int> DeleteQuote(int quoteId, string userId);
        Task<List<Quote>> GetQuotesForVideo(string videoId);
        Task<Quote?> GetQuoteById(int id);
        Task<int> Vote(SubmittedQuoteVote vote, string userId);
        Task<List<QuoteVote>> GetVotesForUser(string userId);
        Task<int> DeleteVote(int voteId, string userId);
    }
}
