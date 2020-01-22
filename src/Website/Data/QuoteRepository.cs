using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Quote;
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
            => await _npgsql.ScalarInt("SELECT COUNT(*) FROM quotes;") ?? 0;
        

        public async Task<bool> UserCanCreateQuote(string userId)
        {
            var commandText = 
                "SELECT " +
                    "quotes.submitted_at AS submitted_at, " +
                    "quotes_userdata.user_id AS user_id " +
                "FROM quotes " +
                "LEFT JOIN quotes_userdata ON quotes_userdata.quote = quotes.id " +
                "WHERE user_id = @UserId " +
                "AND submitted_at >= @NowMinus15Seconds;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@UserId", NpgsqlDbType.Text, userId);
            command.Parameters.AddWithValue("@NowMinus15Seconds", NpgsqlDbType.TimestampTz, DateTime.Now - TimeSpan.FromSeconds(15));
            using var r = await command.ExecuteReaderAsync();
            if (r.HasRows)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        public async Task<int?> SaveQuote(SubmittedQuote quote, string userId)
        {
            if (!quote.At.HasValue)
            {
                return null;
            }

            int? result = await _npgsql.ScalarInt("INSERT INTO quotes (id, video, content, at, submitted_at) VALUES (DEFAULT, @V, @C, @A, DEFAULT) RETURNING id;",
                _npgsql.Parameter("@Q", NpgsqlDbType.Integer, quote.VideoId),
                _npgsql.Parameter("@C", NpgsqlDbType.Text, quote.Content),
                _npgsql.Parameter("@A", NpgsqlDbType.Integer, quote.At.Value));

            if (!result.HasValue)
            {
                return null;
            }

            await _npgsql.NonQuery("INSERT INTO quotes_userdata (quote, user_id) VALUES (@Q, @U);",
                _npgsql.Parameter("@Q", NpgsqlDbType.Integer, result),
                _npgsql.Parameter("@U", NpgsqlDbType.Text, userId));

            return result;
        }

        public async Task<int> DeleteQuote(int quoteId, string userId)
        {
            var commandText =
                   "DELETE FROM quotes " +
                   "USING quotes_userdata " +
                   "WHERE quotes_userdata.quote = quotes.id " +
                   "AND quotes_userdata.quote = @I " +
                   "AND quotes_userdata.user_id = @U;";

            return await _npgsql.NonQuery(commandText,
                _npgsql.Parameter("@I", NpgsqlDbType.Integer, quoteId),
                _npgsql.Parameter("@U", NpgsqlDbType.Text, userId));
        }

        public async Task<List<Quote>> GetQuotesForVideo(string videoId, string? userId)
        {
            var result = new List<Quote>();

            var commandText =
                "SELECT " +
                    "q.id, q.video, q.content, q.at, q.submitted_at, " +
                    "u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "WHERE video = @V " +
                "ORDER BY submitted_at ASC; ";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@V", NpgsqlDbType.Text, videoId);

            using var reader = await command.ExecuteReaderAsync();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;

                    result.Add(new Quote()
                    {
                        Id = reader.GetInt32(i++),
                        VideoId = reader.GetString(i++),
                        QuoteText = reader.GetString(i++),
                        At = reader.GetInt32(i++),
                        SubmissionTime = reader.GetDateTime(i++),
                        Contributor = reader.IsDBNull(i++) ? "[Deleted User]" : reader.GetString(i - 1)
                    });
                }
            }
            
            if (result.Count > 0)
            {
                await AddVotesToQuotes(result, userId);
            }

            return result;
        }

        public async Task AddVotesToQuotes(Quote quote, string? userId)
            => await AddVotesToQuotes(new List<Quote>() { quote }, userId);

        public async Task AddVotesToQuotes(List<Quote> quotes, string? userId)
        {
            if (userId is null)
            {
                return;
            }

            var ids = quotes.Select(x => (x.Id, $"@{x.Id}X")).ToList();
            var commandText = $"SELECT quote, vote FROM quote_votes WHERE user_id = @U AND quote IN ({string.Join(", ", ids.Select(x => x.Item2))});";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            foreach (var id in ids)
            {
                command.Parameters.AddWithValue(id.Item2, NpgsqlDbType.Integer, id.Id);
            }

            using var reader = await command.ExecuteReaderAsync();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    var quoteId = reader.GetInt32(0);
                    var vote = (Vote?)reader.GetInt32(1);
                    quotes.First(x => x.Id == quoteId).Vote = vote;
                }
            }
        }

        public async Task<Quote?> GetQuoteById(int id, string? userId)
        {
            Quote? result = null;

            string commandText =
                "SELECT " +
                    "q.id, q.video, q.content, q.at, q.submitted_at, " +
                    "u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN public.quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "WHERE q.id = @I ";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@I", NpgsqlDbType.Integer, id);

            using var reader = await command.ExecuteReaderAsync();
            if (reader.HasRows)
            {
                reader.Read();
                int i = 0;

                result = new Quote()
                {
                    Id = reader.GetInt32(i++),
                    VideoId = reader.GetString(i++),
                    QuoteText = reader.GetString(i++),
                    At = reader.GetInt32(i++),
                    SubmissionTime = reader.GetDateTime(i++),
                    Contributor = reader.IsDBNull(i++) ? "[Deleted User]" : reader.GetString(i - 1)
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
            if (vote.Vote is null || vote.QuoteId is null)
            {
                return 0;
            }

            var commandText =
                "INSERT INTO quote_votes (id, vote, user_id, quote, voted_at) " +
                "VALUES (DEFAULT, @V, @U, @Q, DEFAULT) " +
                "ON CONFLICT ON CONSTRAINT quote_votes_pk DO UPDATE " +
                "SET vote = @V " +
                "WHERE quote_votes.user_id = @U " +
                "AND quote_votes.quote = @Q " +
                "RETURNING id;";

            return await _npgsql.ScalarInt(commandText,
                _npgsql.Parameter("@V", NpgsqlDbType.Integer, (int)vote.Vote.Value),
                _npgsql.Parameter("@U", NpgsqlDbType.Text, userId),
                _npgsql.Parameter("@Q", NpgsqlDbType.Integer, vote.QuoteId.Value)) ?? 0;
        }

        public async Task<List<Quote>> GetQuotesForUser(string userId)
        {
            var result = new List<Quote>();

            string commandText =
                "SELECT q.id, q.video, q.content, q.at, q.submitted_at, i.\"UserName\", v.vote " +
                "FROM public.quotes q " +
                "LEFT JOIN public.quotes_userdata u ON q.id = u.quote " +
                "LEFT JOIN identity.\"AspNetUsers\" i ON i.\"Id\" = u.user_id " +
                "LEFT JOIN public.quote_votes v ON v.quote = q.id AND v.user_id = u.user_id " +
                "WHERE u.user_id = @UserId " +
                "ORDER BY q.submitted_at DESC;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@UserId", NpgsqlDbType.Text, userId);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    result.Add(new Quote()
                    {
                        Id = reader.GetInt32(i++),
                        VideoId = reader.GetString(i++),
                        QuoteText = reader.GetString(i++),
                        At = reader.GetInt32(i++),
                        SubmissionTime = reader.GetDateTime(i++),
                        Contributor = reader.GetString(i++),
                        Vote = reader.IsDBNull(i) ? null : (Vote?)reader.GetInt32(i)
                    });
                }
            }

            return result;
        }

        public async Task<List<QuoteVote>> GetVotesForUser(string userId)
        {
            var result = new List<QuoteVote>();
            
            string commandText =
                "SELECT v.id, v.vote, v.quote, v.voted_at, u.\"UserName\" " +
                "FROM public.quote_votes v " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = v.user_id " +
                "WHERE v.user_id = @U;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);

            using var reader = await command.ExecuteReaderAsync();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int i = 0;
                    result.Add(new QuoteVote()
                    {
                        Id = reader.GetInt32(i++),
                        Vote = (Vote)reader.GetInt32(i++),
                        Quote = reader.GetInt32(i++),
                        VoteTime = reader.GetDateTime(i++),
                        UserName = reader.IsDBNull(i++) ? "[Deleted User]" : reader.GetString(i - 1)
                    });
                }
            }

            return result;
        }

        public async Task<int> DeleteVote(int voteId, string userId)
            => await _npgsql.NonQuery("DELETE FROM quote_votes WHERE id = @I AND user_id = @U;",
                _npgsql.Parameter("@I", NpgsqlDbType.Integer, voteId),
                _npgsql.Parameter("@U", NpgsqlDbType.Text, userId));
        

        public async Task<List<Quote>> RandomQuotes(int amount, string? userId)
        {
            var randomQuotes = new List<Quote>();
            var commandText =
                "SELECT q.id, q.video, q.content, q.at, q.submitted_at, u.\"UserName\" " +
                "FROM public.quotes q " +
                "LEFT JOIN quotes_userdata d ON d.quote = q.id " +
                "LEFT JOIN identity.\"AspNetUsers\" u ON u.\"Id\" = d.user_id " +
                "ORDER BY RANDOM() LIMIT @Limit;";
            
            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@Limit", NpgsqlDbType.Integer, amount);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    randomQuotes.Add(new Quote()
                    {
                        Id = reader.GetInt32(0),
                        VideoId = reader.GetString(1),
                        QuoteText = reader.GetString(2),
                        At = reader.GetInt32(3),
                        SubmissionTime = reader.GetDateTime(4),
                        Contributor = reader.IsDBNull(5) ? "[Unknown]" : reader.GetString(5)
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

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@Limit", NpgsqlDbType.Integer, amount);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    newestQuotes.Add(new Quote()
                    {
                        Id = reader.GetInt32(0),
                        VideoId = reader.GetString(1),
                        QuoteText = reader.GetString(2),
                        At = reader.GetInt32(3),
                        SubmissionTime = reader.GetDateTime(4),
                        Contributor = reader.IsDBNull(5) ? "[Unknown]" : reader.GetString(5)
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

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@Search", NpgsqlDbType.Text, $"%{searchTerm}%");
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    foundQuotes.Add(new Quote()
                    {
                        Id = reader.GetInt32(0),
                        VideoId = reader.GetString(1),
                        QuoteText = reader.GetString(2),
                        At = reader.GetInt32(3),
                        SubmissionTime = reader.GetDateTime(4),
                        Contributor = reader.IsDBNull(5) ? "[Unknown]" : reader.GetString(5)
                    });
                }
            }

            if (foundQuotes.Count > 0 && !string.IsNullOrEmpty(userId))
            {
                await AddVotesToQuotes(foundQuotes, userId);
            }

            return foundQuotes;
        }


        public async Task<bool> UserSubmittedQuote(int quoteId, string userId)
        {
            var commandText = "SELECT id FROM quotes_userdata WHERE quote = @QuoteId AND user_id = @UserId;";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@QuoteId", NpgsqlDbType.Integer, quoteId);
            command.Parameters.AddWithValue("@UserId", NpgsqlDbType.Text, userId);
            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                return true;
            }
            else
            {
                return false;
            }
        }


        public async Task<int> UpdateQuote(UpdateQuote quote, string userId)
        {
            if (!quote.At.HasValue 
                || !quote.Id.HasValue 
                || string.IsNullOrWhiteSpace(quote.QuoteText) 
                || !await UserSubmittedQuote(quote.Id.Value, userId))
            {
                return 0;
            }

            return await _npgsql.NonQuery("UPDATE quotes SET content = @Content, at = @At WHERE id = @Id;",
                _npgsql.Parameter("@Content", NpgsqlDbType.Text, quote.QuoteText),
                _npgsql.Parameter("@At", NpgsqlDbType.Integer, quote.At.Value),
                _npgsql.Parameter("@Id", NpgsqlDbType.Integer, quote.Id.Value));
        }
    }
}
