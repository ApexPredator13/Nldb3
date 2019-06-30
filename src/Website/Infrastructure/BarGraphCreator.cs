using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models;
using Website.Models.Resource;
using Website.Services;

namespace Website.Infrastructure
{
    public class BarGraphCreator : IBarGraphCreator
    {
        private readonly IVideoRepository _videoRepository;

        public BarGraphCreator(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        public async Task<ChartObject> ThroughoutTheLetsPlay(string label, List<DateTime> timestamps, IsaacResourceSearchOptions searchOptions)
        {
            var bottomLabels = Enumerable.Repeat(string.Empty, searchOptions.Amount).ToList();
            var dataSet = new DataSet(searchOptions.Amount, label);

            // get timespan between start and end
            var start = IsaacEpisodeTimeProvider.FromGameVersionName(searchOptions.Start);
            var end = IsaacEpisodeTimeProvider.FromGameVersionName(searchOptions.End);

            if (start is null)
            {
                start = await _videoRepository.GetFirstVideoReleaseDate();
            }

            if (end is null)
            {
                end = await _videoRepository.GetMostRecentVideoReleaseDate();
            }

            var totalSpan = (end.Value - start.Value).TotalSeconds;

            // how much of the time every bar stands for
            var timeSpanPerBar = totalSpan / searchOptions.Amount;

            // fill array with empty GraphBars, add color
            for (int i = 0; i < searchOptions.Amount; i++)
            {
                DateTime dateToCalculateBarColorFor = start.Value.AddSeconds(timeSpanPerBar * i + timeSpanPerBar);
                var color = GetBarColorForDate(dateToCalculateBarColorFor);
                dataSet.BackgroundColor[i] = color;
                dataSet.BorderColor[i] = color;

                // get bottom label if color changed
                if (i is 0 || !dataSet.BackgroundColor[i].Equals(dataSet.BackgroundColor[i - 1]))
                {
                    bottomLabels[i] = GetLabelFromColor(color);
                }
            }

            foreach (var timeStamp in timestamps)
            {
                // how far away from start?
                var secondsAwayFromStart = (timeStamp - start).Value.TotalSeconds;

                // which bar?
                var barNumber = (int)Math.Floor(((double)searchOptions.Amount * (double)secondsAwayFromStart) / (double)totalSpan);

                // increment found bar - add to the last graph if it's a round number and rounding down is not possible
                try
                {
                    dataSet.Data[barNumber]++;
                }
                catch (IndexOutOfRangeException)
                {
                    dataSet.Data[barNumber - 1]++;
                }
            }

            return new ChartObject(bottomLabels, new List<DataSet>() { dataSet });
        }

        private static string GetBarColorForDate(DateTime date)
        {
            if (date <= ImportantDates.vanillaEnd)
            {
                return ImportantDates.ColorVanilla;
            }
            else if (date <= ImportantDates.wotlEnd)
            {
                return ImportantDates.ColorWotl;
            }
            else if (date <= ImportantDates.crEnd)
            {
                return ImportantDates.ColorWotl;
            }
            else if (date <= ImportantDates.rebirthEnd)
            {
                return ImportantDates.ColorRebirth;
            }
            else if (date <= ImportantDates.afterbirthEnd)
            {
                return ImportantDates.ColorAfterbirth;
            }
            else
            {
                return ImportantDates.ColorAfterbirthPlus;
            }
        }

        private static string GetLabelFromColor(string color)
        {
            return color switch
            {
                ImportantDates.ColorVanilla => "Vanilla",
                ImportantDates.ColorWotl => "Wrath of the Lamb",
                ImportantDates.ColorRebirth => "Rebirth",
                ImportantDates.ColorAfterbirth => "Afterbirth",
                ImportantDates.ColorAfterbirthPlus => "Afterbirth Plus",
                ImportantDates.ColorRepentance => "Repentance",
                _ => "?",
            };
        }
    }
}
