using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Services;

namespace Website.Data
{
    public class DiscussionTopicsRepository : IDiscussionTopicsRepository
    {
        private readonly INpgsql _npgsql;

        public DiscussionTopicsRepository(INpgsql npgsql)
        {
            _npgsql = npgsql;
        }

        public async Task<int> Create(DiscussionTopic topic, string userId)
        {
            var commandText = "INSERT INTO discussion_topics (video, topic, user_id, submitted_at) VALUES (@V, @T, @U, DEFAULT);";

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@V", NpgsqlDbType.Text, topic.VideoId);
            command.Parameters.AddWithValue("@T", NpgsqlDbType.Text, topic.Topic);
            command.Parameters.AddWithValue("@U", NpgsqlDbType.Text, userId);

            return await command.ExecuteNonQueryAsync();
        }

        public async Task<List<DiscussionTopic>> GetTopicsForVideo(string videoId)
        {
            var commandText = "SELECT video, topic FROM discussion_topics WHERE video = @V;";
            var foundTopics = new List<DiscussionTopic>();

            using var connection = await _npgsql.Connect();
            using var command = new NpgsqlCommand(commandText, connection);
            command.Parameters.AddWithValue("@V", NpgsqlDbType.Text, videoId);
            using var r = await command.ExecuteReaderAsync();

            if (r.HasRows)
            {
                while (r.Read())
                {
                    foundTopics.Add(new DiscussionTopic()
                    {
                        VideoId = r.GetString(0),
                        Topic = r.GetString(1)
                    });
                }
            }

            return foundTopics;
        }
    }
}
