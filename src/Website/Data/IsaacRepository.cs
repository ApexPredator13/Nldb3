using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
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

        public async Task<bool> CoordinatesAreTaken(int x, int y, int h, int w)
        {
            var query = "SELECT 1 FROM isaac_resources WHERE x && @X IS TRUE;";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    // y-coordinate needs to be flipped
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Box, new NpgsqlBox(-y, x + (w - 1), -y - (h - 1), x));

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        public async Task<int> UpdateName(string id, string newName)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("UPDATE isaac_resources SET name = @N WHERE id = @I;", c))
                {
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, newName);
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, id);
                    return await q.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<int> UpdateId(string oldId, string newId)
        {
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand("UPDATE isaac_resources SET id = @NewId WHERE id = @OldId;", c))
                {
                    q.Parameters.AddWithValue("@NewId", NpgsqlDbType.Varchar, newId);
                    q.Parameters.AddWithValue("@OldId", NpgsqlDbType.Varchar, oldId);
                    return await q.ExecuteNonQueryAsync();
                }
            }
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

                    var result = Convert.ToInt32(await q.ExecuteScalarAsync());
                    return result;
                }
            }
        }

        public async Task<string> GetFirstResourceIdFromName(string name)
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

        public async Task<string> SaveResource(CreateIsaacResource resource, int x, int y, int w, int h)
        {
            string query = "INSERT INTO isaac_resources (id, name, type, exists_in, x, game_mode, color, mod, display_order, difficulty) VALUES (" +
                "@I, @N, @D, @E, @X, @M, @C, @L, @O, @U) RETURNING id;";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, resource.Id);
                    q.Parameters.AddWithValue("@N", NpgsqlDbType.Varchar, resource.Name);
                    q.Parameters.AddWithValue("@D", NpgsqlDbType.Integer, (int)resource.ResourceType);
                    q.Parameters.AddWithValue("@E", NpgsqlDbType.Integer, (int)resource.ExistsIn);
                    // y-coordinate needs to be flipped
                    q.Parameters.AddWithValue("@X", NpgsqlDbType.Box, new NpgsqlBox(-y, x + (w - 1), -y - (h - 1), x));
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

        private string GetOrderByClause(ResourceOrderBy orderBy, string prefix, bool asc)
        {
            switch (orderBy)
            {
                case ResourceOrderBy.Color: return $"{prefix}.color {(asc ? "ASC" : "DESC")}";
                case ResourceOrderBy.Difficulty: return $"{prefix}.difficulty {(asc ? "ASC" : "DESC")} NULLS LAST";
                case ResourceOrderBy.DisplayOrder: return $"{prefix}.display_order {(asc ? "ASC" : "DESC")} NULLS LAST";
                case ResourceOrderBy.ExistsIn: return $"{prefix}.exists_in {(asc ? "ASC" : "DESC")}";
                case ResourceOrderBy.GameMode: return $"{prefix}.game_mode {(asc ? "ASC" : "DESC")}";
                case ResourceOrderBy.Id: return $"{prefix}.id {(asc ? "ASC" : "DESC")}";
                case ResourceOrderBy.Name: return $"{prefix}.name {(asc ? "ASC" : "DESC")}";
                case ResourceOrderBy.Type: return $"{prefix}.type {(asc ? "ASC" : "DESC")}";
                default: return $"{prefix}.id";
            }
        }

        #region StatementCreatorsForGetResources

        private void CreateSelectStatementForRequest(StringBuilder s, GetResource request)
        {
            s.Append($"SELECT i.id, i.name, i.type, i.exists_in, i.x, i.game_mode, i.color, i.display_order, i.difficulty");

            if (request.IncludeMod)
            {
                s.Append($", m.id, m.name, u.id, u.url, u.name");
            }
            if (request.IncludeTags || request.RequiredTags.Count > 0)
            {
                s.Append($", t.id, t.value");
            }
        }

        private void CreateFromAndJoinStatementFromRequest(StringBuilder s, GetResource request)
        {
            s.Append(" FROM isaac_resources i");

            if (request.IncludeMod)
            {
                s.Append(" LEFT JOIN mods m ON i.mod = m.id");
                s.Append(" LEFT JOIN mod_url u ON m.id = u.mod");
            }
            if (request.IncludeTags || request.RequiredTags.Count > 0)
            {
                s.Append(" LEFT JOIN tags t ON t.isaac_resource = i.id");
            }
        }

        private List<NpgsqlParameter> CreateWhereStatementForRequest(StringBuilder s, GetResource request)
        {
            var parameters = new List<NpgsqlParameter>();

            if (request.ResourceType == ResourceType.Unspecified && request.RequiredTags.Count is 0)
            {
                return parameters;
            }

            s.Append(" WHERE");
            bool needAnd = false;

            if (request.ResourceType != ResourceType.Unspecified)
            {
                needAnd = true;
                s.Append(" i.type = @T");
                parameters.Add(new NpgsqlParameter("@T", NpgsqlDbType.Integer) { NpgsqlValue = (int)request.ResourceType });
            }
            
            if (request.RequiredTags.Count > 0)
            {
                if (needAnd)
                {
                    s.Append(" AND");
                }

                s.Append(" t.value IN (");
                for (int i = 0; i < request.RequiredTags.Count; i++)
                {
                    s.Append($"@R{i}, ");
                    parameters.Add(new NpgsqlParameter($"@R{i}", NpgsqlDbType.Integer) { NpgsqlValue = (int)request.RequiredTags[i] });
                }
                s.Length -= 2;
                s.Append(")");
            }

            return parameters;
        }

        private void CreateGroupByStatementForRequest(StringBuilder s, GetResource request)
        {
            s.Append(" GROUP BY i.id");

            if (request.IncludeMod)
            {
                s.Append(", m.id, u.id");
            }
            if (request.IncludeTags || request.RequiredTags.Count > 0)
            {
                s.Append(", t.id");
            }
        }

        private void CreateOrderByStatementForRequest(StringBuilder s, GetResource request)
        {
            if (request.OrderBy1 != ResourceOrderBy.Unspecified)
            {
                s.Append($" ORDER BY {GetOrderByClause(request.OrderBy1, "i", request.Asc)}");
            }
            if (request.OrderBy2 != ResourceOrderBy.Unspecified)
            {
                s.Append($", {GetOrderByClause(request.OrderBy2, "i", request.Asc)}");
            }
        }

        #endregion

        public async Task<List<IsaacResource>> GetResources(GetResource request)
        {
            var resources = new List<IsaacResource>();
            var parameters = new List<NpgsqlParameter>();

            var s = new StringBuilder();

            CreateSelectStatementForRequest(s, request);
            CreateFromAndJoinStatementFromRequest(s, request);
            parameters.AddRange(CreateWhereStatementForRequest(s, request));
            CreateGroupByStatementForRequest(s, request);
            CreateOrderByStatementForRequest(s, request);

            // ...Execute
            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(s.ToString(), c))
                {
                    q.Parameters.AddRange(parameters.ToArray());

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
                                        CssCoordinates = (NpgsqlBox)r[i++],
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                                        Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1)
                                    });
                                }
                                else i += 9;

                                var currentResource = resources.First(x => x.Id == resourceId);

                                if (request.IncludeMod)
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

                                if (request.IncludeTags && !r.IsDBNull(i) && !currentResource.Tags.Any(x => x.Id == r.GetInt32(i)))
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
            s.Append($"SELECT i.id, i.name, i.type, i.exists_in, i.x, i.game_mode, i.color, i.display_order, i.difficulty");

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
                s.Append(" LEFT JOIN mods m ON i.mod = m.id");
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
                                        CssCoordinates = (NpgsqlBox)r[i++],
                                        GameMode = (GameMode)r.GetInt32(i++),
                                        Color = r.GetString(i++),
                                        DisplayOrder = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1),
                                        Difficulty = r.IsDBNull(i++) ? null : (int?)r.GetInt32(i - 1)
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

        public async Task<int> MakeTransformative(MakeIsaacResourceTransformative model)
        {
            string query =
                "INSERT INTO transformative_resources (id, isaac_resource, transformation, counts_multiple_times, requires_title_content, valid_from, valid_until, steps_needed) " +
                $"VALUES (DEFAULT, @IR, @TR, @CM, @RT, {(model.ValidFrom.HasValue ? "@VF" : "DEFAULT")}, {(model.ValidUntil.HasValue ? "@VU" : "DEFAULT")}, @SN) RETURNING id;";

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(query, c))
                {
                    q.Parameters.AddWithValue("@IR", NpgsqlDbType.Varchar, model.ResourceId);
                    q.Parameters.AddWithValue("@TR", NpgsqlDbType.Varchar, model.TransformationId);
                    q.Parameters.AddWithValue("@CM", NpgsqlDbType.Boolean, model.CanCountMultipleTimes);
                    q.Parameters.AddWithValue("@RT", NpgsqlDbType.Varchar, model.RequiresTitleContent ?? (object)DBNull.Value);
                    q.Parameters.AddWithValue("@SN", NpgsqlDbType.Integer, model.StepsNeeded);
                    if (model.ValidFrom.HasValue) q.Parameters.AddWithValue("@VF", NpgsqlDbType.TimestampTz, model.ValidFrom ?? (object)DBNull.Value);
                    if (model.ValidUntil.HasValue) q.Parameters.AddWithValue("@VU", NpgsqlDbType.TimestampTz, model.ValidUntil ?? (object)DBNull.Value);

                    return Convert.ToInt32(await q.ExecuteScalarAsync());
                }
            }
        }

        public async Task<bool> IsSpacebarItem(string resourceId)
        {
            bool isSpacebarItem = false;

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand($"SELECT 1 FROM tags WHERE isaac_resource = @Resource AND value = {(int)Effect.IsSpacebarItem}; ", c))
                {
                    q.Parameters.AddWithValue("@Resource", NpgsqlDbType.Varchar, resourceId);
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            isSpacebarItem = true;
                        }
                    }
                }
            }

            return isSpacebarItem;
        }

        public async Task<List<(string transformation, bool countsMultipleTimes, int stepsNeeded)>> GetTransformationData(string resourceId, string videoTitle, DateTime videoReleasedate)
        {
            var result = new List<(string, bool, int)>();

            using (var c = await _connector.Connect())
            {
                using (var q = new NpgsqlCommand(
                    "SELECT t.isaac_resource, t.transformation, t.counts_multiple_times, t.requires_title_content, t.valid_from, t.valid_until, t.steps_needed " +
                    "FROM transformative_resources t " +
                    "WHERE isaac_resource = @I " +
                    "AND valid_from <= @R " +
                    "AND valid_until >= @R; ", c))
                {
                    q.Parameters.AddWithValue("@I", NpgsqlDbType.Varchar, resourceId);
                    q.Parameters.AddWithValue("@R", NpgsqlDbType.TimestampTz, videoReleasedate);

                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                string? requiredTitleContent = r.IsDBNull(3) ? null : r.GetString(3);

                                if (requiredTitleContent != null && !videoTitle.ToLower().Contains(requiredTitleContent.ToLower()))
                                {
                                    continue;
                                }

                                result.Add((r.GetString(1), r.GetBoolean(2), r.GetInt32(6)));
                            }
                        }
                    }
                }
            }

            return result;
        }
    }
}
