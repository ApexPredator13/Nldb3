using AutoFixture.Xunit2;
using AutoFixture.AutoMoq;
using System;
using AutoFixture;

namespace WebsiteTests.Tools
{
    public class AutoDataMoqAttribute : AutoDataAttribute
    {
        private static readonly Func<IFixture> fixtureFactory = new Func<IFixture>(() =>
        {
            var f = new Fixture().Customize(new AutoMoqCustomization());
            return f;
        });

        public AutoDataMoqAttribute() : base(fixtureFactory) { }
    }
}
