"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Boxes_1 = require("../General/Boxes");
var Searchbox_1 = require("../General/Searchbox");
var WhatFloorAreWeOn = /** @class */ (function () {
    function WhatFloorAreWeOn(subscriber, firstFloors, allFloors, selectedFloorProcessor, isFirstPromptToSelectFloor) {
        var boxes = new Boxes_1.Boxes(subscriber, 3, firstFloors, undefined, false);
        boxes.Subscribe(selectedFloorProcessor);
        var searchbox = new Searchbox_1.SearchboxComponent(subscriber, 4, allFloors, false);
        searchbox.Subscribe(selectedFloorProcessor);
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', isFirstPromptToSelectFloor ? 'What floor did we start on?' : 'What floor are we on?']
                },
                boxes,
                {
                    e: ['hr']
                },
                searchbox
            ]
        };
    }
    return WhatFloorAreWeOn;
}());
exports.WhatFloorAreWeOn = WhatFloorAreWeOn;
//# sourceMappingURL=m-what-floor-are-we-on.js.map