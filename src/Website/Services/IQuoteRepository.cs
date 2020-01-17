using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Quote;
using Website.Models.SubmitEpisode;

namespace Website.Services
{
    public interface IQuoteRepository
    {
        Task<int?> SaveQuote(SubmittedQuote quote, string userId);
        Task<int> DeleteQuote(int quoteId, string userId);
        Task<List<Quote>> GetQuotesForVideo(string videoId, string? userId);
        Task<Quote?> GetQuoteById(int id, string? userId);
        Task<int> Vote(SubmittedQuoteVote vote, string userId);
        Task<List<QuoteVote>> GetVotesForUser(string userId);
        Task<int> DeleteVote(int voteId, string userId);
        Task<int> CountQuotes();
        Task<List<Quote>> RandomQuotes(int amount, string? userId);
        Task<List<Quote>> NewestQuotes(int amount, string? userId);
        Task<List<Quote>> Search(string searchTerm, string? userId);
        Task<bool> UserCanCreateQuote(string userId);
        Task<List<Quote>> GetQuotesForUser(string userId);
        Task<bool> UserSubmittedQuote(int quoteId, string userId);
        Task<int> UpdateQuote(UpdateQuote quote, string userId);
    }
}
