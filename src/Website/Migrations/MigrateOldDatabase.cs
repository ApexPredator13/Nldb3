using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Website.Models.Database.Enums;
using Website.Services;
using System.Threading.Tasks;
using Website.Models.Validation;
using NpgsqlTypes;
using System;
using Website.Models.Validation.SubmitEpisode;

namespace Website.Migrations
{
    public class MigrateOldDatabase : IMigrateOldDatabase
    {
        private readonly string _newConnectionString;
        private readonly string _oldConnectionString;
        private readonly string _oldIdentityConnectionString;
        private readonly string _adminUsername;
        private readonly ILogger<MigrateOldDatabase> _logger;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IIsaacRepository _isaacRepository;
        private readonly IVideoRepository _videoRepository;
        private readonly IModRepository _modRepository;

        public MigrateOldDatabase(
            IConfiguration config, 
            ILogger<MigrateOldDatabase> logger, 
            UserManager<IdentityUser> userManager,
            IIsaacRepository bossRepository,
            IVideoRepository videoRepository,
            IModRepository modRepository
        )
        {
            _oldConnectionString = config.GetConnectionString("OldDatabaseConnection");
            _oldIdentityConnectionString = config.GetConnectionString("OldDatabaseConnectionIdentity");
            _newConnectionString = config.GetConnectionString("DefaultConnection");
            _adminUsername = config["AdminUsername"];
            _logger = logger;
            _userManager = userManager;
            _isaacRepository = bossRepository;
            _videoRepository = videoRepository;
            _modRepository = modRepository;
        }

        public void MigrateUsers()
        {
            if (_userManager.Users.Count() > 1)
            {
                _logger.LogWarning("skipping user migration, users already exist in the database");
                return;
            }

            var c_identity_old = new NpgsqlConnection(_oldIdentityConnectionString);
            var c_identity_new = new NpgsqlConnection(_newConnectionString);

            try
            {
                c_identity_old.Open();
                c_identity_new.Open();
            }
            catch
            {
                _logger.LogWarning("cannot migrate users, no connection to the old database");
                return;
            }

            // AspNetUsers
            _logger.LogInformation("started copying users");

            string getUsersQuery = 
                "SELECT \"Id\", \"AccessFailedCount\", \"ConcurrencyStamp\", \"Email\", \"EmailConfirmed\", \"LockoutEnabled\", \"LockoutEnd\", " +
                "\"NormalizedEmail\", \"NormalizedUserName\", \"PasswordHash\", \"PhoneNumber\", \"PhoneNumberConfirmed\", \"SecurityStamp\", " +
                $"\"TwoFactorEnabled\", \"UserName\" FROM \"AspNetUsers\" WHERE \"UserName\" != '{_adminUsername}'; ";

            var insertQuery = new StringBuilder();

            using (var q = new NpgsqlCommand(getUsersQuery, c_identity_old))
            {
                insertQuery.Append("INSERT INTO \"AspNetUsers\" (" +
                    "\"Id\", \"AccessFailedCount\", \"ConcurrencyStamp\", \"Email\", \"EmailConfirmed\", \"LockoutEnabled\", \"LockoutEnd\", " +
                    "\"NormalizedEmail\", \"NormalizedUserName\", \"PasswordHash\", \"PhoneNumber\", \"PhoneNumberConfirmed\", \"SecurityStamp\", " +
                    "\"TwoFactorEnabled\", \"UserName\") VALUES ");

                using (var r = q.ExecuteReader())
                {
                    if (r.HasRows)
                    {
                        while (r.Read())
                        {
                            _logger.LogInformation($"adding user with id {r.GetString(0)}");

                            insertQuery.Append(
                                $"('{r.GetString(0)}', {r.GetInt32(1)}, '{r.GetString(2)}', '{r.GetString(3)}', {r.GetBoolean(4)}, {r.GetBoolean(5)}, null, " +
                                $"'{r.GetString(7)}', '{r.GetString(8)}', {(r.IsDBNull(9) ? "'null'" : "'" + r.GetString(9) + "'")}, {(r.IsDBNull(10) ? "null" : "'" + r.GetString(10) + "'")}, {r.GetBoolean(11)}, '{r.GetString(12)}', " +
                                $"{r.GetBoolean(13)}, '{r.GetString(14)}'), ");
                        }
                    }
                }

                insertQuery.Length -= 2;
            }

            _logger.LogInformation("executing user copy...");
            using (var q = new NpgsqlCommand(insertQuery.ToString(), c_identity_new))
            {
                q.ExecuteNonQuery();
            }


            // AspNetUserLogins
            string getUserLoginsQuery = "SELECT \"LoginProvider\", \"ProviderKey\", \"ProviderDisplayName\", \"UserId\" FROM \"AspNetUserLogins\"; ";
            var insertUserLogins = new StringBuilder();
            insertUserLogins.Append("INSERT INTO \"AspNetUserLogins\" (\"LoginProvider\", \"ProviderKey\", \"ProviderDisplayName\", \"UserId\") VALUES ");

            using (var q = new NpgsqlCommand(getUserLoginsQuery, c_identity_old))
            {
                using (var r = q.ExecuteReader())
                {
                    if (r.HasRows)
                    {
                        while (r.Read())
                        {
                            insertUserLogins.Append($"('{r.GetString(0)}', '{r.GetString(1)}', null, '{r.GetString(3)}'), ");
                        }
                    }
                }
            }

            insertUserLogins.Length -= 2;

            using (var q = new NpgsqlCommand(insertUserLogins.ToString(), c_identity_new))
            {
                q.ExecuteNonQuery();
            }

            c_identity_old.Dispose();
            c_identity_new.Dispose();
        }

        public async Task MigrateMods()
        {
            var mods = new List<SaveMod>
            {
                new SaveMod("Antibirth"),
                new SaveMod("Community Remix"),
                new SaveMod("Mei"),
                new SaveMod("Siren, Playable Character"),
                new SaveMod("The Binding of NLSS Afterstream+"),
                new SaveMod("Alphabirth Pack 1: Mom's Closet"),
                new SaveMod("Faith's Reward"),
                new SaveMod("The Drawn"),
                new SaveMod("King Saul"),
                new SaveMod("Arena Mode"),
                new SaveMod("alotmoreitems"),
                new SaveMod("Buddy In A Box"),
                new SaveMod("Black Hole"),
                new SaveMod("Mystery Gift"),
                new SaveMod("Sprinkler"),
                new SaveMod("AngryFly"),
                new SaveMod("Bozo"),
                new SaveMod("Broken Modem"),
                new SaveMod("Lil' Delirium"),
                new SaveMod("The Binding of NLSS Afterstream+"),
                new SaveMod("Booster Pack #1"),
                new SaveMod("Adventure Sheet"),
                new SaveMod("Flask of the Gods"),
                new SaveMod("Moving Box"),
                new SaveMod("Telepathy"),
                new SaveMod("Technology Zero"),
                new SaveMod("Jumper Cables"),
                new SaveMod("Cereal Cutout"),
                new SaveMod("Leprosy"),
                new SaveMod("Mr. Meeseeks"),
                new SaveMod("Lil Harbingers"),
                new SaveMod("Thought"),
                new SaveMod("Bank Shot!"),
                new SaveMod("The RPGing of Isaac"),
                new SaveMod("Death's List"),
                new SaveMod("Water Balloon"),
                new SaveMod("Hungry Tears"),
                new SaveMod("Lightshot"),
                new SaveMod("Satanic Ritual"),
                new SaveMod("Security Blanket"),
                new SaveMod("Hydrophobicity"),
                new SaveMod("Lil Spewer"),
                new SaveMod("Mystery Egg")
            };

            foreach (var mod in mods)
            {
                await _modRepository.SaveMod(mod);
            }
        }

        public async Task MigrateBosses()
        {
            if (await _isaacRepository.CountResources(ResourceType.Boss) > 0)
            {
                _logger.LogWarning("bosses already exist in database, skipping migration...");
                return;
            }

            List<SaveIsaacResource> newBosses = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, csshorizontaloffset, cssverticaloffset, urlname, width, isdoublebossfight, frommod FROM bosses; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newBosses.Add(new SaveIsaacResource()
                                {
                                    Name = r.GetString(0),
                                    X = r.GetInt32(1),
                                    Y = r.GetInt32(2),
                                    W = r.GetInt32(4),
                                    Id = r.GetString(3),
                                    FromMod = r.IsDBNull(6) ? null : await _modRepository.GetModIdByName(r.GetString(6)),
                                    ResourceType = ResourceType.Boss,
                                    H = 0
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving bosses...");

            foreach (var b in newBosses)
            {
                await _isaacRepository.SaveResource(b);
            }
        }

        public async Task MigrateCharacters()
        {
            if (await _isaacRepository.CountResources(ResourceType.Character) > 0)
            {
                _logger.LogWarning("characters already exist in database, skipping migration...");
                return;
            }

            var newCharacters = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset, frommod FROM characters; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newCharacters.Add(new SaveIsaacResource()
                                {
                                    Name = r.GetString(0),
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3),
                                    W = 40,
                                    Id = r.GetString(1),
                                    FromMod = r.IsDBNull(4) ? null : await _modRepository.GetModIdByName(r.GetString(4)),
                                    ResourceType = ResourceType.Character
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving characters...");

            foreach (var c in newCharacters)
            {
                await _isaacRepository.SaveResource(c);
            }
        }

        public async Task MigrateCurses()
        {
            if (await _isaacRepository.CountResources(ResourceType.Curse) > 0)
            {
                _logger.LogWarning("curses already exist in database, skipping migration...");
                return;
            }

            var newCurses = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, frommod FROM curses; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                var x = r.GetString(1);
                                newCurses.Add(new SaveIsaacResource()
                                {
                                    Id = string.Join(string.Empty, r.GetString(0).Split(" ").Select(a => char.ToUpper(a[0]).ToString() + a.Substring(1))),
                                    Name = r.GetString(0),
                                    FromMod = r.IsDBNull(2) ? null : await _modRepository.GetModIdByName(r.GetString(2)),
                                    ResourceType = ResourceType.Curse
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving curses...");

            foreach (var c in newCurses)
            {
                await _isaacRepository.SaveResource(c);
            }
        }

        public async Task MigrateThreats()
        {
            if (await _isaacRepository.CountResources(ResourceType.Threat) > 0)
            {
                _logger.LogWarning("threats already exist in database, skipping migration...");
                return;
            }

            var newThreats = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset, frommod FROM deaths; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newThreats.Add(new SaveIsaacResource()
                                {
                                    Name = r.GetString(0),
                                    Id = r.GetString(1),
                                    W = 40,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3),
                                    FromMod = r.IsDBNull(4) ? null : await _modRepository.GetModIdByName(r.GetString(4)),
                                    ResourceType = ResourceType.Threat
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving threats...");

            foreach (var t in newThreats)
            {
                await _isaacRepository.SaveResource(t);
            }
        }

        public async Task MigrateFloors()
        {
            if (await _isaacRepository.CountResources(ResourceType.Floor) > 0)
            {
                _logger.LogWarning("floors already exist in database, skipping migration...");
                return;
            }

            var newFloors = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT urlname, name, frommod FROM floors; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newFloors.Add(new SaveIsaacResource()
                                {
                                    Id = r.GetString(0),
                                    Name = r.GetString(1),
                                    FromMod = r.IsDBNull(2) ? null : await _modRepository.GetModIdByName(r.GetString(2)),
                                    ResourceType = ResourceType.Floor
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving floors...");

            foreach (var f in newFloors)
            {
                await _isaacRepository.SaveResource(f);
            }
        }

        public async Task MigrateItems()
        {
            if (await _isaacRepository.CountResources(ResourceType.Item) > 0)
            {
                _logger.LogWarning("items already exist in database, skipping migration...");
                return;
            }

            List<SaveIsaacResource> newItems = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset, frommod FROM items; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newItems.Add(new SaveIsaacResource()
                                {
                                    Name = r.GetString(0),
                                    Id = r.GetString(1),
                                    W = 41,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3),
                                    FromMod = r.IsDBNull(4) ? null : await _modRepository.GetModIdByName(r.GetString(4)),
                                    ResourceType = ResourceType.Item
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving items...");

            foreach (var i in newItems)
            {
                await _isaacRepository.SaveResource(i);
            }

            // add transformation info to items
            // get old list
            var transformationData = new List<(string itemName, string transformationName)>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                await c.OpenAsync();

                using (var q = new NpgsqlCommand("SELECT item, transformation FROM transformations_necessaryitems;", c))
                {
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                try
                                {
                                    transformationData.Add((r.GetString(0), r.GetString(1)));
                                }
                                catch { }
                            }
                        }
                    }
                }
            }

            // make new list
            foreach (var (itemName, transformationName) in transformationData)
            {
                string? titleContent = null;
                if (transformationName == "Loki" || transformationName == "Tammy")
                {
                    titleContent = "community remix";
                }
                else if (transformationName == "Waxed")
                {
                    titleContent = "alphabirth";
                }

                var itemId = await _isaacRepository.GetResourceIdFromName(itemName);
                var transformationId = await _isaacRepository.GetResourceIdFromName(transformationName);
                DateTime? validFrom = null;

                switch (transformationId)
                {
                    case "MissingTransformation":
                    case "Guppy":
                        break;
                    case "LordOfTheFlies":
                        validFrom = new DateTime(2014, 11, 4, 0, 0, 0, DateTimeKind.Unspecified);
                        break;
                    case "Spun":
                    case "Conjoined":
                    case "Seraphim":
                    case "Bob":
                    case "Leviathan":
                    case "Mom":
                    case "FunGuy":
                    case "Poop":
                    case "SuperBum":
                    case "Bookworm":
                    case "SpiderBaby":
                    case "Adult":
                        validFrom = new DateTime(2015, 10, 30, 7, 0, 0, DateTimeKind.Unspecified);
                        break;
                    case "Loki":
                    case "Tammy":
                        validFrom = new DateTime(2014, 8, 12, 0, 0, 0, DateTimeKind.Unspecified);
                        break;
                    case "Waxed":
                        validFrom = new DateTime(2017, 3, 16, 0, 0, 0, DateTimeKind.Unspecified);
                        break;
                }

                await _isaacRepository.MakeIsaacResourceTransformative(new MakeIsaacResourceTransformative()
                {
                    CanCountMultipleTimes = false,
                    RequiresTitleContent = titleContent,
                    ResourceId = itemId,
                    TransformationId = transformationId,
                    ValidFrom = validFrom,
                    ValidUntil = null
                });
            }
        }

        public async Task MigrateItemSources()
        {
            if (await _isaacRepository.CountResources(ResourceType.ItemSource) > 0)
            {
                _logger.LogWarning("itemsources  already exist in database, skipping migration...");
                return;
            }

            var newItemsources = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset, frommod FROM itemsources; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newItemsources.Add(new SaveIsaacResource()
                                {
                                    Id = r.GetString(1),
                                    Name = r.GetString(0),
                                    W = 53,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3),
                                    FromMod = r.IsDBNull(4) ? null : await _modRepository.GetModIdByName(r.GetString(4)),
                                    ResourceType = ResourceType.ItemSource
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving itemsources...");

            foreach (var i in newItemsources)
            {
                await _isaacRepository.SaveResource(i);
            }
        }

        public async Task MigrateTransformations()
        {
            if (await _isaacRepository.CountResources(ResourceType.Transformation) > 0)
            {
                _logger.LogWarning("transformations already exist in database, skipping migration...");
                return;
            }

            var newTransformations = new List<SaveIsaacResource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset, frommod FROM transformations; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newTransformations.Add(new SaveIsaacResource()
                                {
                                    Id = r.GetString(1),
                                    Name = r.GetString(0),
                                    W = 50,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3),
                                    FromMod = r.IsDBNull(4) ? null : await _modRepository.GetModIdByName(r.GetString(4)),
                                    ResourceType = ResourceType.Transformation
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving transformations...");
            
            foreach (var t in newTransformations)
            {
                var id = await _isaacRepository.SaveResource(t);
                await _isaacRepository.AddTag(new AddTag() { Effect = Effect.ThreeStepsToTransformation, ResourceId = id });
            }
        }

        //public void MigrateQuotes()
        //{
        //    using (var c = new NpgsqlConnection(_oldConnectionString))
        //    {
        //        c.Open();

        //        using (var q = new NpgsqlCommand("SELECT video, content, whenithappened, sub, id FROM quotes", c))
        //        {
        //            using (var r = q.ExecuteReader())
        //            {
        //                if (r.HasRows)
        //                {
        //                    while (r.Read())
        //                    {
        //                        var video = _context.Videos.FirstOrDefault(x => x.Id == r.GetString(0));
        //                        var user = _userManager.FindByIdAsync(r.GetString(3)).Result;

        //                        _context.Quotes.Add(new Quote
        //                        {
        //                            Contributor = user,
        //                            QuoteText = r.GetString(1),
        //                            SecondsIn = r.GetInt32(2),
        //                            SubmissionTime = null,
        //                            Video = video
        //                        });

        //                        _logger.LogInformation($"migrating quote #{r.GetInt32(4)} from user #{user.Id}");
        //                    }
        //                }
        //            }
        //        }
        //    }

        //    _logger.LogInformation("saving quotes...");
        //    _context.SaveChanges();
        //}

        public async Task MigrateVideos()
        {
            if (await _videoRepository.CountVideos() > 0)
            {
                _logger.LogWarning("videos already exist in the database, skipping migration...");
                return;
            }

            var videos = new List<SaveVideo>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT youtubeid, title, releasedate, duration FROM videos; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                videos.Add(new SaveVideo()
                                {
                                    Id = r.GetString(0),
                                    Title = r.GetString(1),
                                    Published = r.GetDateTime(2),
                                    Duration = r.IsDBNull(3) ? 0 : r.GetInt32(3)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving videos...");

            foreach (var video in videos)
            {
                await _videoRepository.SaveVideo(video);
            }
        }


        public async Task MigrateRuns()
        {
            if (await _videoRepository.CountVideoSubmissions() > 0)
            {
                _logger.LogWarning("runs already exist in the database, skipping migration...");
                return;
            }

            var videoIds = new List<string>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                await c.OpenAsync();
                using (var q = new NpgsqlCommand("SELECT youtubeid FROM videos; ", c))
                {
                    using (var r = await q.ExecuteReaderAsync())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                videoIds.Add(r.GetString(0));
                            }
                        }
                    }
                }
            }

            foreach (var videoId in videoIds)
            {
                _logger.LogInformation($"processing video '{videoId}'");
                var submission = new SubmittedEpisode()
                {
                    VideoId = videoId
                };
                var contributors = new List<string>();

                using (var c = new NpgsqlConnection(_oldConnectionString))
                {
                    c.Open();

                    // get submitters
                    string getSubmittersQuery = $"SELECT sub FROM watchedvideos WHERE video = '{videoId}' ORDER BY id DESC; ";
                    using (var q = new NpgsqlCommand(getSubmittersQuery, c))
                    {
                        using (var r = q.ExecuteReader())
                        {
                            if (r.HasRows)
                            {
                                while (r.Read())
                                {
                                    contributors.Add(r.GetString(0));
                                }
                            }
                        }
                    }

                    if (contributors.Count is 0)
                    {
                        continue;
                    }

                    // FLOOR IDS
                    var floors = new Dictionary<int, (string floor, string death)>();

                    string query = $"SELECT id, urlname, deathby FROM visitedfloors WHERE video = '{videoId}' ORDER BY id ASC; ";
                    using (var q = new NpgsqlCommand(query, c))
                    {
                        using (var r = q.ExecuteReader())
                        {
                            if (r.HasRows)
                            {
                                while (r.Read())
                                {
                                    floors.Add(r.GetInt32(0), (r.GetString(1), r.IsDBNull(2) ? string.Empty : r.GetString(2)));
                                }
                            }
                        }
                    }


                    // go through every floor
                    foreach (var floor in floors)
                    {
                        // get new character
                        string newCharacterQuery = $"SELECT playedcharacters.urlname FROM visitedfloors RIGHT JOIN playedcharacters ON playedcharacters.startedonfloorid = visitedfloors.id WHERE visitedfloors.id = {floor.Key} ORDER BY playedcharacters.id ASC; ";
                        using (var q = new NpgsqlCommand(newCharacterQuery, c))
                        {
                            using (var r = q.ExecuteReader())
                            {
                                if (r.HasRows)
                                {
                                    r.Read();
                                    submission.PlayedCharacters.Add(new PlayedCharacter { CharacterId = (r.GetString(0)) });
                                }
                            }
                        }

                        // add floor to character
                        submission.PlayedCharacters.Last().PlayedFloors.Add(new PlayedFloor() { FloorId = floor.Value.floor, VideoId = videoId });

                        // add bossfights fo floor
                        string bossfightQuery = $"SELECT bossfights.urlname FROM visitedfloors RIGHT JOIN bossfights ON bossfights.visitedfloorid = visitedfloors.id WHERE visitedfloors.id = {floor.Key} ORDER BY bossfights.id ASC; ";
                        using (var q = new NpgsqlCommand(bossfightQuery, c))
                        {
                            using (var r = q.ExecuteReader())
                            {
                                if (r.HasRows)
                                {
                                    while (r.Read())
                                    {
                                        submission.PlayedCharacters.Last().PlayedFloors.Last().gameplayEvents.Add(new GameplayEvent() { RelatedResource1 = r.GetString(0), EventType = GameplayEventType.Bossfight });
                                    }
                                }
                            }
                        }

                        // add curses to floor
                        string curseQuery = $"SELECT activecurse FROM visitedfloors WHERE id = {floor.Key} ORDER BY id ASC; ";
                        using (var q = new NpgsqlCommand(curseQuery, c))
                        {
                            using (var r = q.ExecuteReader())
                            {
                                if (r.HasRows)
                                {
                                    while (r.Read())
                                    {
                                        if (!r.IsDBNull(0))
                                        {
                                            var curseId = string.Join(string.Empty, r.GetString(0).Split(" ").Select(a => char.ToUpper(a[0]).ToString() + a.Substring(1)));
                                            submission.PlayedCharacters.Last().PlayedFloors.Last().gameplayEvents.Add(new GameplayEvent() { RelatedResource1 = curseId, EventType = GameplayEventType.Curse });
                                        }
                                    }
                                }
                            }
                        }

                        // add itempickups to floor
                        string itempickupQuery = $"SELECT collecteditems.urlname, collecteditems.itemsourceurlname FROM visitedfloors RIGHT JOIN collecteditems ON collecteditems.visitedfloorid = visitedfloors.id WHERE visitedfloors.id = {floor.Key} ORDER BY collecteditems.id ASC; ";
                        using (var q = new NpgsqlCommand(itempickupQuery, c))
                        {
                            using (var r = q.ExecuteReader())
                            {
                                if (r.HasRows)
                                {
                                    while (r.Read())
                                    {
                                        submission.PlayedCharacters.Last().PlayedFloors.Last().gameplayEvents.Add(new GameplayEvent() { RelatedResource1 = r.GetString(0), RelatedResource2 = r.GetString(1), EventType = GameplayEventType.Item });
                                    }
                                }
                            }
                        }

                        // add death last
                        if (!string.IsNullOrEmpty(floor.Value.death))
                        {
                            string getDeathQuery = $"SELECT urlname FROM deaths WHERE name = @A; ";
                            using (var q = new NpgsqlCommand(getDeathQuery, c))
                            {
                                q.Parameters.AddWithValue("@A", NpgsqlDbType.Varchar, floor.Value.death);
                                using (var r = q.ExecuteReader())
                                {
                                    if (r.HasRows)
                                    {
                                        r.Read();
                                        submission.PlayedCharacters.Last().PlayedFloors.Last().DeathId = r.GetString(0);
                                        submission.PlayedCharacters.Last().PlayedFloors.Last().gameplayEvents.Add(new GameplayEvent() { EventType = GameplayEventType.CharacterDied, RelatedResource1 = r.GetString(0) });
                                    }
                                }
                            }
                        }
                    }
                }

                // submission complete, now map it to the database
                await _videoRepository.SubmitEpisode(submission, contributors.Last(), SubmissionType.Old);

                // episodes that have been overwritten
                if (contributors.Count > 1)
                {
                    for (int i = 1; i < contributors.Count; i++)
                    {
                        await _videoRepository.SubmitLostEpisode(videoId, contributors[i]);
                    }
                }
            }
        }
    }
}
