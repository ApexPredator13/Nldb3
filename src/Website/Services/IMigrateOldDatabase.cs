using System.Threading.Tasks;

namespace Website.Services
{
    public interface IMigrateOldDatabase
    {
        void MigrateUsers();
        Task MigrateMods();
        Task MigrateBosses();
        Task MigrateCharacters();
        Task MigrateCurses();
        Task MigrateThreats();
        Task MigrateFloors();
        Task MigrateItems();
        Task MigrateItemSources();
        Task MigrateTransformations();
        // Task MigrateQuotes();
        Task MigrateVideos();
        Task MigrateRuns();
    }
}
