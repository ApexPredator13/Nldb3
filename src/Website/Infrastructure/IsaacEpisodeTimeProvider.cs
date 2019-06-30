using System;

namespace Website.Infrastructure
{
    public static class IsaacEpisodeTimeProvider
    {
        public static DateTime? FromGameVersionName(string name)
        {
            switch (name.ToLower())
            {
                case "vanilla":
                    return ImportantDates.vanillaStart;
                case "wotl":
                    return ImportantDates.wotlStart;
                case "communityremix":
                    return ImportantDates.crStart;
                case "rebirth":
                    return ImportantDates.rebirthStart;
                case "afterbirth":
                    return ImportantDates.afterbirthStart;
                case "afterbirthplus":
                    return ImportantDates.afterbirthPlusStart;
                case "antibirth":
                    return ImportantDates.antibirthStart;
                default:
                    return null;
            }
        }
    }
}
