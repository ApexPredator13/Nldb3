using Npgsql;
using NpgsqlTypes;
using System.Collections.Generic;
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
            var id = await _npgsql.ScalarInt("INSERT INTO discussion_topics (id, video, topic, submitted_at) VALUES (DEFAULT, @V, @T, DEFAULT) RETURNING id;",
                _npgsql.Parameter("@V", NpgsqlDbType.Text, topic.VideoId),
                _npgsql.Parameter("@T", NpgsqlDbType.Text, topic.Topic));

            var result = await _npgsql.NonQuery("INSERT INTO discussion_topics_userdata (discussion_topic, user_id) VALUES (@T, @U);",
                _npgsql.Parameter("@T", NpgsqlDbType.Integer, id),
                _npgsql.Parameter("@U", NpgsqlDbType.Text, userId));

            return result;
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



