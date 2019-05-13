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
        private readonly IDbConnector _connector;

        public QuoteRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        public async Task<int> SaveQuote(SubmittedQuote quote, string userId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("INSERT INTO quotes (id, video, content, at, user_id, submitted_at) VALUES (DEFAULT, @V, @C, @A, @U, DEFAULT) RETURNING id;", c);
            q.Parameters.AddWithValue("@V", NpgsqlDbType.Text, quote.VideoId);
            q.Parameters.AddWithValue("@C", NpgsqlDbType.Text, quote.Content);
            q.Parameters.AddWithValue("@A", NpgsqlDbType.Integer, quote.At);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            return Convert.ToInt32(await q.ExecuteScalarAsync());
        }

        public async Task<int> DeleteQuote(int quoteId, string userId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("DELETE FROM quotes WHERE id = @I AND user_id = @U;", c);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Integer, quoteId);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            return await q.ExecuteNonQueryAsync();
        }

        public async Task<List<Quote>> GetQuotesForVideo(string videoId)
        {
            var result = new List<Quote>();

            var query =
                "SELECT " +
                    "q.id, q.video, q.content, q.at, q.submitted_at, " +
                    "u.\"UserName\" " +
                "FROM quotes q " +
                "LEFT JOIN \"AspNetUsers\" u ON u.\"Id\" = q.user_id " +
                "WHERE video = @V " +
                "ORDER BY submitted_at ASC; ";

            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand(query, c);
            q.Parameters.AddWithValue("@V", NpgsqlDbType.Text, videoId);

            using var r = await q.ExecuteReaderAsync();
            if (r.HasRows)
            {
                while (r.Read())
                {
                    int i = 0;

                    result.Add(new Quote()
                    {
                        Id = r.GetInt32(i++),
                        VideoId = r.GetString(i++),
                        QuoteText = r.GetString(i++),
                        At = r.GetInt32(i++),
                        SubmissionTime = r.GetDateTime(i++),
                        Contributor = r.GetString(i++)
                    });
                }
            }

            return result;
        }

        public async Task<Quote?> GetQuoteById(int id)
        {
            Quote? result = null;

            string query =
                "SELECT " +
                    "q.id, q.video, q.content, q.at, q.submitted_at, " +
                    "u.\"UserName\" " +
                "FROM quotes q " +
                "LEFT JOIN \"AspNetUsers\" u ON u.\"Id\" = q.user_id " +
                "WHERE id = @I ";

            using var c = await _connector.Connect();
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
                    Contributor = r.GetString(i++)
                };
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

            using var c = await _connector.Connect();
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
                "FROM quote_votes v " +
                "LEFT JOIN \"AspNetUsers\" u ON u.\"Id\" = v.user_id " +
                "WHERE v.user_id = @U;";

            using var c = await _connector.Connect();
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
                        UserName = r.GetString(i++)
                    });
                }
            }

            return result;
        }

        public async Task<int> DeleteVote(int voteId, string userId)
        {
            using var c = await _connector.Connect();
            using var q = new NpgsqlCommand("DELETE FROM quote_votes WHERE id = @I AND user_id = @U;", c);
            q.Parameters.AddWithValue("@I", NpgsqlDbType.Integer, voteId);
            q.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);
            return await q.ExecuteNonQueryAsync();
        }
    }
}
