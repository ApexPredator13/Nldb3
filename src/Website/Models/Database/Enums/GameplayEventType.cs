namespace Website.Models.Database.Enums
{
    public enum GameplayEventType
    {
        Unspecified,
        CharacterDied,
        ItemCollected,  // 2
        DownToTheNextFloor,
        Bossfight, // 4
        Pill,
        TarotCard,
        Rune,
        Trinket,
        Curse,
        OtherConsumable,
        TransformationComplete, // 11
        TransformationProgress, // 12
        LastFloor,
        AbsorbedItem,
        CharacterReroll,
        WonTheRun,
        LostTheRun,
        ItemTouched
    }
}
