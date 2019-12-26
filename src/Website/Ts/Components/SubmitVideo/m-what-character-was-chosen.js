"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderBoxes_1 = require("../General/renderBoxes");
var WhatCharacterWasChosen = /** @class */ (function () {
    function WhatCharacterWasChosen(subscriber, resources, selectedCharacterGoesTo) {
        var boxes = new renderBoxes_1.Boxes(subscriber, 1, resources, undefined, false);
        boxes.Subscribe(selectedCharacterGoesTo);
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What character was chosen?']
                },
                boxes
            ]
        };
    }
    return WhatCharacterWasChosen;
}());
exports.WhatCharacterWasChosen = WhatCharacterWasChosen;
//# sourceMappingURL=m-what-character-was-chosen.js.map