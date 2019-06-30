using System;

namespace Website.Infrastructure
{
    public class ImportantDates
    {
        public static readonly DateTime vanillaStart = new DateTime(2011, 9, 29, 2, 57, 30, DateTimeKind.Utc);
        public static readonly DateTime vanillaEnd = new DateTime(2012, 5, 26, 15, 0, 8, DateTimeKind.Utc);
        public static readonly DateTime wotlStart = new DateTime(2012, 05, 28, 19, 3, 58, DateTimeKind.Utc);
        public static readonly DateTime wotlEnd = new DateTime(2014, 11, 3, 19, 20, 48, DateTimeKind.Utc);
        public static readonly DateTime crStart = new DateTime(2014, 8, 12, 3, 0, 0, DateTimeKind.Utc);
        public static readonly DateTime crEnd = new DateTime(2014, 10, 15, 20, 27, 46, DateTimeKind.Utc);
        public static readonly DateTime rebirthStart = new DateTime(2014, 11, 4, 15, 0, 0, DateTimeKind.Utc);
        public static readonly DateTime rebirthEnd = new DateTime(2015, 10, 29, 16, 0, 0, DateTimeKind.Utc);
        public static readonly DateTime afterbirthStart = new DateTime(2015, 10, 30, 17, 0, 0, DateTimeKind.Utc);
        public static readonly DateTime afterbirthEnd = new DateTime(2017, 1, 3, 15, 0, 0, 0, DateTimeKind.Utc);
        public static readonly DateTime afterbirthPlusStart = new DateTime(2017, 1, 4, 0, 0, 0, DateTimeKind.Utc);
        public static readonly DateTime antibirthStart = new DateTime(2016, 12, 24, 0, 0, 0, DateTimeKind.Utc);

        public const string ColorVanilla = "yellow";
        public const string ColorWotl = "#7501a5";
        public const string ColorRebirth = "red";
        public const string ColorAfterbirth = "blue";
        public const string ColorAfterbirthPlus = "green";
        public const string ColorAntibirth = "#7a1616";
        public const string ColorRepentance = "#3765a1";
    }
}
