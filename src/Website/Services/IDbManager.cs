namespace Website.Services
{
    public interface IDbManager
    {
        void DropTablesInDevMode();
        void CreateAllTablesIfNotExists();
    }
}
