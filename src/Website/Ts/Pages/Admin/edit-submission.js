"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("../../Framework/renderer");
var router_1 = require("../../Framework/router");
var _admin_link_creator_1 = require("./_admin-link-creator");
var http_1 = require("../../Framework/http");
var isaac_image_1 = require("../../Components/General/isaac-image");
var enum_to_string_converters_1 = require("../../Enums/enum-to-string-converters");
var EditSubmission = /** @class */ (function () {
    function EditSubmission(parameters) {
        var _this = this;
        this.videoId = parameters[0];
        this.submissionId = parameters[1];
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Edit Played Characters']
                },
                {
                    e: ['div', 'loading...'],
                    a: [[renderer_1.A.Id, 'edit-characters']]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h1', 'Edit Floors']
                },
                {
                    e: ['div', 'loading...'],
                    a: [[renderer_1.A.Id, 'edit-floors']]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h1', 'Edit Events']
                },
                {
                    e: ['div', 'loading...'],
                    a: [[renderer_1.A.Id, 'edit-events']]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h1', 'Delete Submission'],
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Delete Submission'],
                            a: [[renderer_1.A.Href, _admin_link_creator_1.AdminLink.DeleteSubmission(parseInt(this.submissionId, 10))]],
                            v: [[renderer_1.EventType.Click, function (e) { return router_1.navigate(_admin_link_creator_1.AdminLink.DeleteSubmission(parseInt(_this.submissionId, 10)), e); }]]
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Back to submissions'],
                            v: [[renderer_1.EventType.Click, function (e) { return router_1.navigate(_admin_link_creator_1.AdminLink.AdminSubmissions(), e); }]],
                            a: [[renderer_1.A.Class, 'u hand']]
                        }
                    ]
                }
            ]
        };
        this.A = this.CreateAsyncPart();
    }
    EditSubmission.prototype.CreateAsyncPart = function () {
        var _this = this;
        // load characters...
        var characters = {
            I: 'edit-characters',
            P: http_1.get("/Admin/Submissions/" + this.videoId + "/" + this.submissionId + "/Characters").then(function (characters) {
                if (!characters) {
                    return {
                        e: ['div', 'no characters found']
                    };
                }
                var lines = new Array();
                for (var _i = 0, characters_1 = characters; _i < characters_1.length; _i++) {
                    var character = characters_1[_i];
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td'],
                                c: [
                                    new isaac_image_1.IsaacImage(character.character, undefined, undefined, false)
                                ]
                            },
                            {
                                e: ['td', character.character.name],
                                a: [[renderer_1.A.Class, 'u hand']]
                                // click: go to edit character page
                            },
                            {
                                e: ['td', character.action.toString(10)]
                            }
                        ]
                    });
                }
                var table = {
                    e: ['table'],
                    c: [
                        {
                            e: ['thead'],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Played Character'],
                                            a: [[renderer_1.A.Colspan, "2"]]
                                        },
                                        {
                                            e: ['th', 'Action #']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['tbody'],
                            c: lines
                        }
                    ]
                };
                return table;
            })
        };
        // load floors...
        var floors = {
            I: 'edit-floors',
            P: http_1.get("/Admin/Submissions/" + this.videoId + "/" + this.submissionId + "/Floors").then(function (floors) {
                if (!floors) {
                    return {
                        e: ['div', 'no floors found']
                    };
                }
                var lines = new Array();
                for (var _i = 0, floors_1 = floors; _i < floors_1.length; _i++) {
                    var floor = floors_1[_i];
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td'],
                                c: [
                                    new isaac_image_1.IsaacImage(floor.floor, undefined, undefined, false)
                                ]
                            },
                            {
                                e: ['td', floor.floor.name],
                                a: [[renderer_1.A.Class, 'u hand']]
                                // click: go to edit floor page
                            },
                            {
                                e: ['td', floor.action.toString(10)]
                            },
                            {
                                e: ['td', floor.duration.toString(10)]
                            },
                            {
                                e: ['td', floor.floor_number.toString(10)]
                            }
                        ]
                    });
                }
                var table = {
                    e: ['table'],
                    c: [
                        {
                            e: ['thead'],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Played Floor'],
                                            a: [[renderer_1.A.Colspan, "2"]]
                                        },
                                        {
                                            e: ['th', 'Action #']
                                        },
                                        {
                                            e: ['th', 'Duration']
                                        },
                                        {
                                            e: ['th', 'Floor Number']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['tbody'],
                            c: lines
                        }
                    ]
                };
                return table;
            })
        };
        // load events...
        var events = {
            I: 'edit-events',
            P: http_1.get("/Admin/Submissions/" + this.videoId + "/" + this.submissionId + "/Events").then(function (events) {
                if (!events) {
                    return {
                        e: ['div', 'no events found']
                    };
                }
                var lines = new Array();
                var _loop_1 = function (event_1) {
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td', event_1.id.toString(10)]
                            },
                            {
                                e: ['td', event_1.action.toString(10)]
                            },
                            {
                                e: ['td'],
                                c: [
                                    new isaac_image_1.IsaacImage(event_1, 1, undefined, false)
                                ]
                            },
                            {
                                e: ['td', enum_to_string_converters_1.gameplayEventTypeToString(event_1.event_type)],
                                a: [[renderer_1.A.Class, 'u hand']],
                                v: [[renderer_1.EventType.Click, function (e) { return router_1.navigate(_admin_link_creator_1.AdminLink.EditGameplayEvent(event_1.id), e); }]]
                            },
                            {
                                e: ['td', 'Delete'],
                                a: [[renderer_1.A.Class, 'u hand']],
                                v: [[renderer_1.EventType.Click, function (e) { return router_1.navigate(_admin_link_creator_1.AdminLink.DeleteEvent(_this.videoId, parseInt(_this.submissionId, 10), event_1.id), e); }]]
                            },
                            {
                                e: ['td', 'Add Event'],
                                a: [[renderer_1.A.Class, 'u hand']],
                                v: [[renderer_1.EventType.Click, function (e) { return router_1.navigate(_admin_link_creator_1.AdminLink.InsertGameplayEvent(_this.videoId, parseInt(_this.submissionId, 10), event_1.id, event_1.played_character, event_1.played_floor, event_1.run_number, event_1.floor_number), e); }]]
                            }
                        ]
                    });
                };
                for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                    var event_1 = events_1[_i];
                    _loop_1(event_1);
                }
                var table = {
                    e: ['table'],
                    c: [
                        {
                            e: ['thead'],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Id']
                                        },
                                        {
                                            e: ['th', 'Action #']
                                        },
                                        {
                                            e: ['th', 'Event'],
                                            a: [[renderer_1.A.Colspan, "3"]]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['tbody'],
                            c: lines
                        }
                    ]
                };
                return table;
            })
        };
        return [characters, floors, events];
    };
    EditSubmission.RegisterPage = function () {
        var page = {
            Component: EditSubmission,
            Title: 'Edit Submission',
            Url: ['Admin', 'EditSubmission', '{videoId}', '{submissionId}']
        };
        router_1.registerPage(page);
    };
    return EditSubmission;
}());
exports.EditSubmission = EditSubmission;
//# sourceMappingURL=edit-submission.js.map