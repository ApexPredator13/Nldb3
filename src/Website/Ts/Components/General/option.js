"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("../../Framework/renderer");
var Option = /** @class */ (function () {
    function Option(value, text, selected) {
        this.E = {
            e: ['option', text],
            a: [[renderer_1.A.Value, value], selected ? [renderer_1.A.Selected, 'true'] : null]
        };
    }
    return Option;
}());
exports.Option = Option;
//# sourceMappingURL=option.js.map