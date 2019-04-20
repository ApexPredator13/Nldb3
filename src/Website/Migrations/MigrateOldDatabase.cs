using Microsoft.EntityFrameworkCore.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Website.Data;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Services;
using System.Threading.Tasks;
using System.Threading.Channels;
using Website.Models.Validation;

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
        private readonly IItemRepository _itemRepository;
        private readonly IBossRepository _bossRepository;
        private readonly ICharacterRepository _characterRepository;
        private readonly ICurseRepository _curseRepository;
        private readonly IThreatRepository _threatRepository;
        private readonly IFloorRepository _floorRepository;
        private readonly IItemsourceRepository _itemsourceRepository;
        private readonly ITransformationRepository _transformationRepository;
        private readonly IVideoRepository _videoRepository;

        public MigrateOldDatabase(
            IConfiguration config, 
            ILogger<MigrateOldDatabase> logger, 
            UserManager<IdentityUser> userManager,
            IItemRepository itemRepository,
            IBossRepository bossRepository,
            ICharacterRepository characterRepository,
            ICurseRepository curseRepository,
            IThreatRepository threatRepository,
            IFloorRepository floorRepository,
            IItemsourceRepository itemsourceRepository,
            ITransformationRepository transformationRepository,
            IVideoRepository videoRepository
        )
        {
            _oldConnectionString = config.GetConnectionString("OldDatabaseConnection");
            _oldIdentityConnectionString = config.GetConnectionString("OldDatabaseConnectionIdentity");
            _newConnectionString = config.GetConnectionString("DefaultConnection");
            _adminUsername = config["AdminUsername"];
            _logger = logger;
            _userManager = userManager;
            _itemRepository = itemRepository;
            _bossRepository = bossRepository;
            _characterRepository = characterRepository;
            _curseRepository = curseRepository;
            _threatRepository = threatRepository;
            _floorRepository = floorRepository;
            _itemsourceRepository = itemsourceRepository;
            _transformationRepository = transformationRepository;
            _videoRepository = videoRepository;
        }

        public void MigrateUsers()
        {
            if (_userManager.Users.Count() > 1)
            {
                // _userManager.Users.Where(x => x.UserName != _adminUsername).ToList().ForEach(u => _userManager.DeleteAsync(u).Wait());
                _logger.LogWarning("skipping user migration, more than 1 user already exists");
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

        public async Task MigrateBosses()
        {
            List<SaveBoss> newBosses = new List<SaveBoss>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, csshorizontaloffset, cssverticaloffset, urlname, width, isdoublebossfight FROM bosses; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newBosses.Add(new SaveBoss()
                                {
                                    Name = r.GetString(0),
                                    X = r.GetInt32(1),
                                    Y = r.GetInt32(2),
                                    W = r.GetInt32(4),
                                    Id = r.GetString(3),
                                    DoubleTrouble = r.GetBoolean(5)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving bosses...");

            foreach (var b in newBosses)
            {
                await _bossRepository.SaveBoss(b);
            }
        }

        public async Task MigrateCharacters()
        {
            var newCharacters = new List<SaveCharacter>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset FROM characters; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newCharacters.Add(new SaveCharacter()
                                {
                                    Name = r.GetString(0),
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3),
                                    W = 40,
                                    Id = r.GetString(1)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving characters...");

            foreach (var c in newCharacters)
            {
                await _characterRepository.SaveCharacter(c);
            }
        }

        public async Task MigrateCurses()
        {
            var newCurses = new List<SaveCurse>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname FROM curses; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                var x = r.GetString(1);
                                newCurses.Add(new SaveCurse()
                                {
                                    Id = string.Join(string.Empty, r.GetString(0).Split(" ").Select(a => char.ToUpper(a[0]).ToString() + a.Substring(1))),
                                    Name = r.GetString(0)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving curses...");

            foreach (var c in newCurses)
            {
                await _curseRepository.SaveCurse(c);
            }
        }

        public async Task MigrateThreats()
        {
            List<SaveThreat> newThreats = new List<SaveThreat>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset FROM deaths; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newThreats.Add(new SaveThreat()
                                {
                                    Name = r.GetString(0),
                                    Id = r.GetString(1),
                                    W = 40,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving threats...");

            foreach (var t in newThreats)
            {
                await _threatRepository.SaveThreat(t);
            }
        }

        public async Task MigrateFloors()
        {
            var newFloors = new List<SaveFloor>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT urlname, name FROM floors; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newFloors.Add(new SaveFloor()
                                {
                                    Id = r.GetString(0),
                                    Name = r.GetString(1)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving floors...");

            foreach (var f in newFloors)
            {
                await _floorRepository.SaveFloor(f);
            }
        }

        public async Task MigrateItems()
        {
            List<SaveItem> newItems = new List<SaveItem>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset FROM items; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newItems.Add(new SaveItem()
                                {
                                    Name = r.GetString(0),
                                    Id = r.GetString(1),
                                    W = 41,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving items...");

            foreach (var i in newItems)
            {
                await _itemRepository.SaveItem(i);
            }
        }

        public async Task MigrateItemSources()
        {
            var newItemsources = new List<SaveItemsource>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset FROM itemsources; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newItemsources.Add(new SaveItemsource()
                                {
                                    Id = r.GetString(1),
                                    Name = r.GetString(0),
                                    W = 53,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving itemsources...");

            foreach (var i in newItemsources)
            {
                await _itemsourceRepository.SaveItemsource(i);
            }
        }

        public async Task MigrateTransformations()
        {
            var newTransformations = new List<SaveTransformation>();
            using (var c = new NpgsqlConnection(_oldConnectionString))
            {
                c.Open();

                using (var q = new NpgsqlCommand("SELECT name, urlname, csshorizontaloffset, cssverticaloffset FROM transformations; ", c))
                {
                    using (var r = q.ExecuteReader())
                    {
                        if (r.HasRows)
                        {
                            while (r.Read())
                            {
                                newTransformations.Add(new SaveTransformation()
                                {
                                    Id = r.GetString(1),
                                    Name = r.GetString(0),
                                    W = 50,
                                    X = r.GetInt32(2),
                                    Y = r.GetInt32(3)
                                });
                            }
                        }
                    }
                }
            }

            _logger.LogInformation($"saving transformations...");
            
            foreach (var t in newTransformations)
            {
                await _transformationRepository.SaveTransformation(t);
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
                    string getSubmittersQuery = $"SELECT sub FROM watchedvideos WHERE video = '{videoId}' ORDER BY id ASC; ";
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
                        submission.PlayedCharacters.Last().PlayedFloors.Add(new PlayedFloor() { FloorId = floor.Value.floor });

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
                                        submission.PlayedCharacters.Last().PlayedFloors.Last().gameplayEvents.Add(new GameplayEvent() { RelatedResource1 = r.GetString(0), RelatedResource2 = r.GetString(1), EventType = GameplayEventType.DeprecatedCollectedItem });
                                    }
                                }
                            }
                        }

                        // add death last
                        if (!string.IsNullOrEmpty(floor.Value.death))
                        {
                            submission.PlayedCharacters.Last().PlayedFloors.Last().DeathId = floor.Value.death;
                            submission.PlayedCharacters.Last().PlayedFloors.Last().gameplayEvents.Add(new GameplayEvent() { EventType = GameplayEventType.CharacterDied, RelatedResource1 = floor.Value.death });
                        }
                    }
                }

                // submission complete, now map it to the database
                await _videoRepository.SubmitEpisode(submission, contributors.Last());

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
