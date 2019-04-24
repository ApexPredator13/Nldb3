using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Services;

namespace Website.Data
{
    public class IsaacRepository : IIsaacRepository
    {
        private readonly IDbConnector _connector;

        public IsaacRepository(IDbConnector connector)
        {
            _connector = connector;
        }

        public async Task<int> CountResources(ResourceType type = ResourceType.Unspecified)
        {
            string query = type == ResourceType.Unspecified
                ? "SELECT COUNT(*) FROM isaac_resources;"
                : "SELECT COUNT(*) FROM isaac_resources WHERE type = @Type;";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    if (type != ResourceType.Unspecified)
                    {
                        q.Parameters.AddWithValue("@Type", NpgsqlDbType.Integer, (int)type);
                    }

                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<string> GetResourceIdFromName(string name)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT id FROM isaac_resources WHERE name = @Name", c))
                {
                    q.Parameters.AddWithValue("@Name", NpgsqlDbType.Varchar, name);
                    return Convert.ToString(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<string> SaveResource(SaveIsaacResource resource)
        {
            string query = "INSERT INTO isaac_resources (id, name, type, exists_in, x, y, w, h, game_mode, color, mod, display_order, difficulty) VALUES (" +
                "@I, @N, @D, @E, @X, @Y, @W, @H, @M, @C, @L, @O, @U) RETURNING id;";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, resource.Id);
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, resource.Name);
                    q.Parameters.AddWithValue("@D", NpgsqlDbType.Integer, (int)resource.ResourceType);
                    q.Parameters.AddWithValue("@E", NpgsqlDbType.Integer, (int)resource.ExistsIn);
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Integer, resource.X);
                    q.Parameters.AddWithValue("@Y", NpgsqlDbType.Integer, resource.Y);
                    q.Parameters.AddWithValue("@W", NpgsqlDbType.Integer, resource.W);
                    q.Parameters.AddWithValue("@H", NpgsqlDbType.Integer, resource.H);
                    q.Parameters.AddWithValue("@M", NpgsqlDbType.Integer, (int)resource.GameMode);
                    q.Parameters.AddWithValue("@C", NpgsqlDbType.Varchar, resource.Color);
                    q.Parameters.AddWithValue("@L", NpgsqlDbType.Integer, resource.FromMod ?? (object)DBNull.Value);
                    q.Parameters.AddWithValue("@O", NpgsqlDbType.Integer, resource.DisplayOrder ?? (object)DBNull.Value);
                    q.Parameters.AddWithValue("@U", NpgsqlDbType.Integer, resource.Difficulty ?? (object)DBNull.Value);

                    return Convert.ToString(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<int> AddTag(AddTag tag)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("INSERT INTO tags (id, value, isaac_resource) VALUES (DEFAULT, @V, @I) RETURNING id; ", c))
                {
                    q.Parameters.AddWithValue("@V", NpgsqlDbType.Integer, (int)tag.Effect);
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, tag.ResourceId);
                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        private string GetOrderByClause(ResourceOrderBy orderBy, string prefix)
        {
            switch (orderBy)
            {
                case ResourceOrderBy.Color: return $"{prefix}.color";
                case ResourceOrderBy.Difficulty: return $"{prefix}.difficulty NULLS LAST";
                case ResourceOrderBy.DisplayOrder: return $"{prefix}.display_order NULLS LAST";
                case ResourceOrderBy.ExistsIn: return $"{prefix}.exists_in";
                case ResourceOrderBy.GameMode: return $"{prefix}.game_mode";
                case ResourceOrderBy.Id: return $"{prefix}.id";
                case ResourceOrderBy.Name: return $"{prefix}.name";
                case ResourceOrderBy.Type: return $"{prefix}.type";
                default: return $"{prefix}.id";
            }
        }

        public async Task<List<IsaacResource>> GetResources(ResourceType resourceType, bool includeMod, bool includeTags, ResourceOrderBy orderBy1 = ResourceOrderBy.Unspecified, ResourceOrderBy orderBy2 = ResourceOrderBy.Unspecified, bool asc = true, params Effect[] requiredTags)
        {
            var resources = new List<IsaacResource>();
            var parameters = new List<NpgsqlParameter>();

            var s = new StringBuilder();

            // SELECT
            s.Append($"SELECT i.id, i.name, i.type, i.exists_in, i.x, i.y, i.w, i.h, i.game_mode, i.color, i.display_order, i.difficulty");

            if (includeMod)
            {
                s.Append($", m.id, m.name, u.id, u.url, u.name");
            }
            if (includeTags || requiredTags.Length > 0)
            {
                s.Append($", t.id, t.value");
            }

            // FROM
            s.Append(" FROM isaac_resources i");

            // JOIN
            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON i.mod = m.id");
                s.Append(" LEFT JOIN mod_url u ON m.id = u.mod");
            }
            if (includeTags || requiredTags.Length > 0)
            {
                s.Append(" LEFT JOIN tags t ON t.isaac_resource = i.id");
            }

            // WHERE
            if (resourceType != ResourceType.Unspecified)
            {
                s.Append(" WHERE i.type = @T");
                parameters.Add(new NpgsqlParameter("@T", NpgsqlDbType.Integer) { NpgsqlValue = (int)resourceType });
            }
            if (requiredTags.Length > 0)
            {
                s.Append(" AND t.isaac_resource IN (");
                for (int i = 0; i < requiredTags.Length; i++)
                {
                    s.Append($"@R{i}, ");
                    parameters.Add(new NpgsqlParameter($"@R{i}", NpgsqlDbType.Integer) { NpgsqlValue = (int)requiredTags[i] });
                }
                s.Length -= 2;
                s.Append(")");
            }

            // GROUP BY
            s.Append(" GROUP BY i.id");

            if (includeMod)
            {
                s.Append(", m.id, u.id");
            }
            if (includeTags || requiredTags.Length > 0)
            {
                s.Append(", t.id");
            }

            // ORDER BY
            if (orderBy1 != ResourceOrderBy.Unspecified)
            {
                s.Append($" ORDER BY {GetOrderByClause(orderBy1, "i")} {(asc ? " ASC" : " DESC")}");
            }
            if (orderBy2 != ResourceOrderBy.Unspecified)
            {
                s.Append($", {GetOrderByClause(orderBy2, "i")} {(asc ? " ASC" : " DESC")}");
            }

            // ...Execute
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    if (resourceType != ResourceType.Unspecified)
                    {
                        q.Parameters.AddWithValue("@T", NpgsqlDbType.Integer, (int)resourceType);
                    }

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;
                                var resourceId = r.GetString(i);
                                if (!resources.Any(x => x.Id == resourceId))
                                {
                                    resources.Add(new IsaacResource()
                                    {
                                        Id = r.GetString(i++),
                                        Name = r.GetString(i++),
                                        ResourceType = (ResourceType)r.GetInt32(i++),
                                        ExistsIn = (ExistsIn)r.GetInt32(i++),
                                        X = r.GetInt32(i++),
                                        Y = r.GetInt32(i++),
                                        W = r.GetInt32(i++),
                                        H = r.GetInt32(i++),
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.IsDBNull(i++) ? (int?)r.GetInt32(i - 1) : null,
                                        Difficulty = r.IsDBNull(i++) ? (int?)r.GetInt32(i - 1) : null
                                    });
                                }
                                else i += 9;

                                var currentResource = resources.First(x => x.Id == resourceId);

                                if (includeMod)
                                {
                                    if (!r.IsDBNull(i) && currentResource.Mod is null)
                                    {
                                        resources.First(x => x.Id == resourceId).Mod = new Mod()
                                        {
                                            Id = r.GetInt32(i++),
                                            ModName = r.GetString(i++),
                                        };
                                    }
                                    else i += 2;

                                    if (!r.IsDBNull(i) && currentResource.Mod != null && !currentResource.Mod!.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                                    {
                                        currentResource.Mod!.ModUrls.Add(new ModUrl()
                                        {
                                            Id = r.GetInt32(i++),
                                            Url = r.GetString(i++),
                                            LinkText = r.GetString(i++)
                                        });
                                    }
                                    else i += 3;
                                }

                                if (includeTags && !r.IsDBNull(i) && !currentResource.Tags.Any(x => x.Id == r.GetInt32(i)))
                                {
                                    currentResource.Tags.Add(new Tag()
                                    {
                                        Id = r.GetInt32(i++),
                                        Effect = (Effect)r.GetInt32(i)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return resources;
        }

        public async Task<IsaacResource?> GetResourceById(string id, bool includeMod, bool includeTags)
        {
            IsaacResource? result = null;

            var s = new StringBuilder();
            s.Append($"SELECT i.id, i.name, i.type, i.exists_in, i.x, i.y, i.w, i.h, i.game_mode, i.color, i.display_order, i.difficulty");

            if (includeMod)
            {
                s.Append($", m.id, m.name, u.id, u.url, u.name");
            }
            if (includeTags)
            {
                s.Append($", t.id, t.value");
            }

            s.Append(" FROM isaac_resources i");

            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON b.mod = m.id");
                s.Append(" LEFT JOIN mod_url u ON m.id = u.mod");
            }
            if (includeTags)
            {
                s.Append(" LEFT JOIN tags t ON t.isaac_resource = i.id");
            }

            s.Append(" WHERE i.id = @Id; ");

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Varchar, id);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;
                                if (result is null)
                                {
                                    result = new IsaacResource()
                                    {
                                        Id = r.GetString(i++),
                                        Name = r.GetString(i++),
                                        ResourceType = (ResourceType)r.GetInt32(i++),
                                        ExistsIn = (ExistsIn)r.GetInt32(i++),
                                        X = r.GetInt32(i++),
                                        Y = r.GetInt32(i++),
                                        W = r.GetInt32(i++),
                                        H = r.GetInt32(i++),
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.IsDBNull(i++) ? (int?)r.GetInt32(i - 1) : null,
                                        Difficulty = r.IsDBNull(i++) ? (int?)r.GetInt32(i - 1) : null
                                    };
                                }
                                else i += 9;

                                if (includeMod)
                                {
                                    if (!r.IsDBNull(i) && result.Mod is null)
                                    {
                                        result.Mod = new Mod()
                                        {
                                            Id = r.GetInt32(i++),
                                            ModName = r.GetString(i++),
                                        };
                                    }
                                    else i += 2;

                                    if (!r.IsDBNull(i) && result.Mod != null && !result.Mod.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                                    {
                                        result.Mod.ModUrls.Add(new ModUrl()
                                        {
                                            Id = r.GetInt32(i++),
                                            Url = r.GetString(i++),
                                            LinkText = r.GetString(i++)
                                        });
                                    }
                                    else i += 3;
                                }

                                if (includeTags && !r.IsDBNull(i) && !result.Tags.Any(x => x.Id == r.GetInt32(i)))
                                {
                                    result.Tags.Add(new Tag()
                                    {
                                        Id = r.GetInt32(i++),
                                        Effect = (Effect)r.GetInt32(i)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }


        public async Task<IsaacResource?> GetResourceByName(string name, bool includeMod, bool includeTags)
        {
            IsaacResource? result = null;

            var s = new StringBuilder();
            s.Append($"SELECT i.id, i.name, i.type, i.exists_in, i.x, i.y, i.w, i.h, i.game_mode, i.color, i.display_order, i.difficulty");

            if (includeMod)
            {
                s.Append($", m.id, m.name, u.id, u.url, u.name");
            }
            if (includeTags)
            {
                s.Append($", t.id, t.value");
            }

            s.Append(" FROM isaac_resources i");

            if (includeMod)
            {
                s.Append(" LEFT JOIN mods m ON b.mod = m.id");
                s.Append(" LEFT JOIN mod_url u ON m.id = u.mod");
            }
            if (includeTags)
            {
                s.Append(" LEFT JOIN tags t ON t.isaac_resource = i.id");
            }

            s.Append(" WHERE i.name = @N; ");

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, name);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                int i = 0;
                                if (result is null)
                                {
                                    result = new IsaacResource()
                                    {
                                        Id = r.GetString(i++),
                                        Name = r.GetString(i++),
                                        ResourceType = (ResourceType)r.GetInt32(i++),
                                        ExistsIn = (ExistsIn)r.GetInt32(i++),
                                        X = r.GetInt32(i++),
                                        Y = r.GetInt32(i++),
                                        W = r.GetInt32(i++),
                                        H = r.GetInt32(i++),
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.IsDBNull(i++) ? (int?)r.GetInt32(i - 1) : null,
                                        Difficulty = r.IsDBNull(i++) ? (int?)r.GetInt32(i - 1) : null
                                    };
                                }
                                else i += 9;

                                if (includeMod)
                                {
                                    if (!r.IsDBNull(i) && result.Mod is null)
                                    {
                                        result.Mod = new Mod()
                                        {
                                            Id = r.GetInt32(i++),
                                            ModName = r.GetString(i++),
                                        };
                                    }
                                    else i += 2;

                                    if (!r.IsDBNull(i) && result.Mod != null && !result.Mod.ModUrls.Any(x => x.Id == r.GetInt32(i)))
                                    {
                                        result.Mod.ModUrls.Add(new ModUrl()
                                        {
                                            Id = r.GetInt32(i++),
                                            Url = r.GetString(i++),
                                            LinkText = r.GetString(i++)
                                        });
                                    }
                                    else i += 3;
                                }

                                if (includeTags && !r.IsDBNull(i) && !result.Tags.Any(x => x.Id == r.GetInt32(i)))
                                {
                                    result.Tags.Add(new Tag()
                                    {
                                        Id = r.GetInt32(i++),
                                        Effect = (Effect)r.GetInt32(i)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }

        public async Task<int> DeleteResource(string resourceId)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("DELETE FROM isaac_resources WHERE id = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Varchar, resourceId);
                    return await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<List<Tag>> GetTags(string resourceId)
        {
            var tags = new List<Tag>();

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT id, value FROM tags WHERE isaac_resource = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Varchar, resourceId);
                    
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                tags.Add(new Tag()
                                {
                                    Id = r.GetInt32(0),
                                    Effect = (Effect)r.GetInt32(1)
                                });
                            }
                        }
                    }
                }
            }

            return tags;
        }

        public async Task<Tag?> GetTagById(int tagId)
        {
            Tag? tag = null;

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("SELECT id, value FROM tags WHERE id = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, tagId);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            r.Read();
                            tag = new Tag()
                            {
                                Id = r.GetInt32(0),
                                Effect = (Effect)r.GetInt32(1)
                            };
                        }
                    }
                }
            }

            return tag;
        }

        public async Task<int> RemoveTag(int tagId)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("DELETE FROM tags WHERE id = @Id; ", c))
                {
                    q.Parameters.AddWithValue("@Id", NpgsqlDbType.Integer, tagId);
                    return await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<int> MakeIsaacResourceTransformative(MakeIsaacResourceTransformative model)
        {
            string query =
                "INSERT INTO transformative_resources (id, isaac_resource, transformation, counts_multiple_times, requires_title_content, valid_from, valid_until) " +
                "VALUES (DEFAULT, @IR, @TR, @CM, @RT, @VF, @VU) RETURNING id;";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@IR", NpgsqlDbType.Varchar, model.ResourceId);
                    q.Parameters.AddWithValue("@TR", NpgsqlDbType.Varchar, model.TransformationId);
                    q.Parameters.AddWithValue("@CM", NpgsqlDbType.Boolean, model.CanCountMultipleTimes);
                    q.Parameters.AddWithValue("@RT", NpgsqlDbType.Varchar, model.RequiresTitleContent ?? (object)DBNull.Value);
                    q.Parameters.AddWithValue("@VF", NpgsqlDbType.TimestampTz, model.ValidFrom ?? (object)DBNull.Value);
                    q.Parameters.AddWithValue("@VU", NpgsqlDbType.TimestampTz, model.ValidUntil ?? (object)DBNull.Value);

                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }
    }
}
