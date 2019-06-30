using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Api.Controllers;
using Xunit;

namespace WebsiteTests.Controllers
{
    public class ResourceControllerTests
    {
        [Fact(DisplayName = "GetEffectNumber can return list of correct numbers")]
        public void T1()
        {
            // arrange
            var controller = new ResourceController(null, null);

            // act
            var result = controller.GetEffectNumber("reGENeratION", "Drops", "catacombsxl", "AAAAAAAAAAAAAAAAA");

            // assert
            result.Should().NotBeNullOrEmpty().And.HaveCount(3);
            result[0].Should().Be(10);
            result[1].Should().Be(22);
            result[2].Should().Be(162);
        }
    }
}
