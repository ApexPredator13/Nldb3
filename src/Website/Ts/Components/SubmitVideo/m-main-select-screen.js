"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("../../Framework/renderer");
var boxes_1 = require("../General/boxes");
var submit_video_1 = require("../../Pages/submit-video");
var browser_1 = require("../../Framework/browser");
var MainSelectScreen = /** @class */ (function () {
    function MainSelectScreen(subscriber, events, consumables, selectionProcessor) {
        var eventBoxes = new boxes_1.Boxes(subscriber, 6, events, '/img/gameplay_events.png', false);
        eventBoxes.Subscribe(selectionProcessor);
        var consumableBoxes = new boxes_1.Boxes(subscriber, 7, consumables, '/img/gameplay_events.png', false);
        consumableBoxes.Subscribe(selectionProcessor);
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What happened?']
                },
                eventBoxes,
                {
                    e: ['h2', 'What was used?']
                },
                consumableBoxes,
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Launch Tutorial!'],
                            a: [[renderer_1.A.Class, 'u hand' + (MainSelectScreen.HighlightTutorial ? ' orange' : ' gray')], [renderer_1.A.Id, 'launch-tutorial']],
                            v: [[renderer_1.EventType.Click, function (e) {
                                        MainSelectScreen.HighlightTutorial = false;
                                        if (subscriber instanceof submit_video_1.SubmitVideo) {
                                            subscriber.LaunchMainMenuTutorial();
                                        }
                                        var target = e.target;
                                        if (target && target instanceof HTMLAnchorElement) {
                                            browser_1.removeClassIfExists(target, 'orange');
                                            browser_1.addClassIfNotExists(target, 'gray');
                                        }
                                    }]]
                        }
                    ]
                }
            ]
        };
    }
    MainSelectScreen.HighlightTutorial = true;
    return MainSelectScreen;
}());
exports.MainSelectScreen = MainSelectScreen;
//# sourceMappingURL=m-main-select-screen.js.map