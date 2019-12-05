using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Services;

namespace Website.Data
{
    public class QuoteRepository : IQuoteRepository
    {
        private readonly INpgsql _npgsql;

        public QuoteRepository(INpgsql npgsql)
        {
            _npgsql = npgsql;
        }

        public async Task<int> CountQuotes()
        {
            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand("SELECT COUNT(*) FROM quotes;", c);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<bool> UserCanCreateQuote(string userId)
        {
            string commandText = 
                "SELECT " +
                    "quotes.submitted_at AS submitted_at, " +
                    "quotes_userdata.user_id AS user_id " +
                "FROM quotes " +
                "LEFT JOIN quotes_userdata ON quotes_userdata.quote = quotes.id " +
                "WHERE user_id = @UserId " +
                "AND submitted_at >= @NowMinus15Seconds;";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(commandText, c);
            q.Parameters.AddWithValue("@UserId", NpgsqlDbType.Text, userId);
            q.Parameters.AddWithValue("@NowMinus15Seconds", NpgsqlDbType.TimestampTz, DateTime.Now - TimeSpan.FromSeconds(15));
            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        public async Task<int> SaveQuote(SubmittedQuote quote, string userId)
        {
            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand("INSERT INTO quotes (id, video, content, at, submitted_at) VALUES (DEFAULT, @V, @C, @A, DEFAULT) RETURNING id;", c);
            q.Parameters.AddWithValue("@V", NpgsqlDbType.Text, quote.VideoId);
            q.Parameters.AddWithValue("@C", NpgsqlDbType.Text, quote.Content);
            q.Parameters.AddWithValue("@A", NpgsqlDbType.Integer, quote.At);
            int result = Convert.ToInt32(await q.ExecuteScalarAsync());

            using var p = new NpgsqlCommand("INSERT INTO quotes_userdata (quote, user_id) VALUES (@Q, @U);", c);
            p.Parameters.AddWithValue("@Q", NpgsqlDbType.Integer, result);
            p.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            await p.ExecuteNonQueryAsync();

            return result;
        }

        public async Task<int> DeleteQuote(int quoteId, string userId)
        {
            string query =
                "DELETE FROM quotes " +
                "USING quotes_userdata " +
                "WHERE quotes_userdata.quote = quotes.id " +
                "AND quotes_userdata.quote = @I " +
                "AND quotes_userdata.user_id = @U;";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Integer, quoteId);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<List<Quote>> GetQuotesForVideo(string videoId, string? userId)
        {
            var quotes = new List<Quote>();

            var query =
                "SELECT " +
                    "q.id, q.video, q.content, q.at, q.submitted_at, " +
                    "u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "WHERE video = @V " +
                "ORDER BY submitted_at ASC; ";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@V", NpgsqlDbType.Text, videoId);

            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;

                    quotes.Add(new Quote()
                    {
                        Id = r.GetInt32(i++),
                        VideoId = r.GetString(i++),
                        QuoteText = r.GetString(i++),
                        At = r.GetInt32(i++),
                        SubmissionTime = r.GetDateTime(i++),
                        Contributor = r.IsDBNull(i++) ? "[Deleted User]" : r.GetString(i - 1)
                    });
                }
            }
            
            if (quotes.Count > 0)
            {
                await AddVotesToQuotes(quotes, userId);
            }

            return quotes;
        }

        public async Task AddVotesToQuotes(Quote quote, string? userId)
        {
            await AddVotesToQuotes(new List<Quote>() { quote }, userId);
        }

        public async Task AddVotesToQuotes(List<Quote> quotes, string? userId)
        {
            if (userId is null)
            {
                return;
            }

            var ids = quotes.Select(x => (x.Id, $"@{x.Id}X")).ToList();
            var commandText = $"SELECT quote, vote FROM quote_votes WHERE user_id = @U AND quote IN ({string.Join(", ", ids.Select(x => x.Item2))});";

            using var c = await _npgsql.Connect();
            using var qVotes = new NpgsqlCommand(commandText, c);
            qVotes.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            foreach (var id in ids)
            {
                qVotes.Parameters.AddWithValue(id.Item2, NpgsqlDbType.Integer, id.Id);
            }

            using var rVotes = await qVotes.ExecuteReaderAsync();
            if (rVotes.HasRows)
            {
                while (rVotes.Read())
                {
                    var quoteId = rVotes.GetInt32(0);
                    var vote = (Vote?)rVotes.GetInt32(1);
                    quotes.First(x => x.Id == quoteId).Vote = vote;
                }
            }
        }

        public async Task<Quote?> GetQuoteById(int id, string? userId)
        {
            Quote? result = null;

            string query =
                "SELECT " +
                    "q.id, q.video, q.content, q.at, q.submitted_at, " +
                    "u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN public.quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "WHERE q.id = @I ";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Integer, id);

            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                r.Read();
                int i = 0;

                result = new Quote()
                {
                    Id = r.GetInt32(i++),
                    VideoId = r.GetString(i++),
                    QuoteText = r.GetString(i++),
                    At = r.GetInt32(i++),
                    SubmissionTime = r.GetDateTime(i++),
                    Contributor = r.IsDBNull(i++) ? "[Deleted User]" : r.GetString(i - 1)
                };
            }

            if (result != null)
            {
                await AddVotesToQuotes(result, userId);
            }

            return result;
        }

        public async Task<int> Vote(SubmittedQuoteVote vote, string userId)
        {
            string query =
                "INSERT INTO quote_votes (id, vote, user_id, quote, voted_at) " +
                "VALUES (DEFAULT, @V, @U, @Q, DEFAULT) " +
                "ON CONFLICT ON CONSTRAINT quote_votes_pk DO UPDATE " +
                "SET vote = @V " +
                "WHERE quote_votes.user_id = @U " +
                "AND quote_votes.quote = @Q " +
                "RETURNING id;";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@V", NpgsqlDbType.Integer, (int)vote.Vote);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            q.Parameters.AddWithValue("@Q", NpgsqlDbType.Integer, vote.QuoteId);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<List<QuoteVote>> GetVotesForUser(string userId)
        {
            var result = new List<QuoteVote>();
            
            string query =
                "SELECT v.id, v.vote, v.quote, v.voted_at, u.\"UserName\" " +
                "FROM public.quote_votes v " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = v.user_id " +
                "WHERE v.user_id = @U;";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);

            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;
                    result.Add(new QuoteVote()
                    {
                        Id = r.GetInt32(i++),
                        Vote = (Vote)r.GetInt32(i++),
                        Quote = r.GetInt32(i++),
                        VoteTime = r.GetDateTime(i++),
                        UserName = r.IsDBNull(i++) ? "[Deleted User]" : r.GetString(i - 1)
                    });
                }
            }

            return result;
        }

        public async Task<int> DeleteVote(int voteId, string userId)
        {
            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand("DELETE FROM quote_votes WHERE id = @I AND user_id = @U;", c);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Integer, voteId);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<List<Quote>> RandomQuotes(int amount, string? userId)
        {
            var randomQuotes = new List<Quote>();
            var commandText =
                "SELECT q.id, q.video, q.content, q.at, q.submitted_at, u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "ORDER BY RANDOM() LIMIT @Limit;";
            
            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(commandText, c);
            q.Parameters.AddWithValue("@Limit", NpgsqlDbType.Integer, amount);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    randomQuotes.Add(new Quote()
                    {
                        Id = r.GetInt32(0),
                        VideoId = r.GetString(1),
                        QuoteText = r.GetString(2),
                        At = r.GetInt32(3),
                        SubmissionTime = r.GetDateTime(4),
                        Contributor = r.GetString(5)
                    });
                }
            }

            if (randomQuotes.Count > 0 && !string.IsNullOrEmpty(userId))
            {
                await AddVotesToQuotes(randomQuotes, userId);
            }

            return randomQuotes;
        }

        public async Task<List<Quote>> NewestQuotes(int amount, string? userId)
        {
            var newestQuotes = new List<Quote>();
            var commandText =
                "SELECT q.id, q.video, q.content, q.at, q.submitted_at, u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "ORDER BY q.submitted_at DESC LIMIT @Limit;";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(commandText, c);
            q.Parameters.AddWithValue("@Limit", NpgsqlDbType.Integer, amount);
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    newestQuotes.Add(new Quote()
                    {
                        Id = r.GetInt32(0),
                        VideoId = r.GetString(1),
                        QuoteText = r.GetString(2),
                        At = r.GetInt32(3),
                        SubmissionTime = r.GetDateTime(4),
                        Contributor = r.IsDBNull(5) ? "[Unknown]" : r.GetString(5)
                    });
                }
            }

            if (newestQuotes.Count > 0 && !string.IsNullOrEmpty(userId))
            {
                await AddVotesToQuotes(newestQuotes, userId);
            }

            return newestQuotes;
        }

        public async Task<List<Quote>> Search(string searchTerm, string? userId)
        {
            var foundQuotes = new List<Quote>();
            var commandText =
                "SELECT q.id, q.video, q.content, q.at, q.submitted_at, u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "WHERE LOWER(q.content) LIKE LOWER(@Search)" +
                "ORDER BY q.submitted_at DESC;";

            using var c = await _npgsql.Connect();
            using var q = new NpgsqlCommand(commandText, c);
            q.Parameters.AddWithValue("@Search", NpgsqlDbType.Text, $"%{searchTerm}%");
            using var r = await q.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    foundQuotes.Add(new Quote()
                    {
                        Id = r.GetInt32(0),
                        VideoId = r.GetString(1),
                        QuoteText = r.GetString(2),
                        At = r.GetInt32(3),
                        SubmissionTime = r.GetDateTime(4),
                        Contributor = r.GetString(5)
                    });
                }
            }

            if (foundQuotes.Count > 0 && !string.IsNullOrEmpty(userId))
            {
                await AddVotesToQuotes(foundQuotes, userId);
            }

            return foundQuotes;
        }
    }
}
