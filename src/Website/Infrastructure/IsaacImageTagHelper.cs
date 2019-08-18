using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database;

namespace Website.Infrastructure
{
    public class IsaacImageTagHelper : TagHelper
    {
        public IsaacResource? Resource { get; set; }
        public bool TwoPlayerMode { get; set; } = false;

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "div";
            output.Attributes.SetAttribute("class", "iri");

            if (Resource != null)
            {
                var x = Resource.X < 0 ? "0" : Resource.X.ToString();
                var y = Resource.Y < 0 ? "0" : Resource.Y.ToString();
                var w = Resource.W <= 5 ? "31" : Resource.W.ToString();
                var h = Resource.H <= 5 ? "31" : Resource.H.ToString();

                var style = $"background: url('/img/isaac.png') -{x}px -{y}px transparent; width: {w}px; height: {h}px;";
                output.Attributes.SetAttribute("style", style);
            }
        }
    }
}
