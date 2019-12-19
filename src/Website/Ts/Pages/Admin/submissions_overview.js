"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("../../Framework/renderer");
var http_1 = require("../../Framework/http");
var router_1 = require("../../Framework/router");
var enum_to_string_converters_1 = require("../../Enums/enum-to-string-converters");
var _admin_link_creator_1 = require("./_admin-link-creator");
var SubmissionsOverview = /** @class */ (function () {
    function SubmissionsOverview() {
        var _this = this;
        this.limit = 50;
        this.offset = 0;
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Submissions']
                },
                {
                    e: ['div'],
                    a: [[renderer_1.A.Id, 'submissions']],
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['button', 'Previous 50'],
                            v: [[renderer_1.EventType.Click, function (e) { return _this.PreviousPage(e); }]]
                        },
                        {
                            e: ['button', 'Next 50'],
                            v: [[renderer_1.EventType.Click, function (e) { return _this.NextPage(e); }]]
                        }
                    ]
                }
            ]
        };
        this.A = [this.CreateAsyncPart()];
    }
    SubmissionsOverview.prototype.NextPage = function (e) {
        e.preventDefault();
        this.offset += 50;
        this.CreateAsyncPart().P.then(function (e) {
            var html = renderer_1.render(e);
            var container = document.getElementById('submissions');
            if (container && html) {
                container.innerHTML = '';
                container.appendChild(html);
            }
        });
    };
    SubmissionsOverview.prototype.PreviousPage = function (e) {
        e.preventDefault();
        if (this.offset <= 0) {
            return;
        }
        this.offset -= 50;
        this.CreateAsyncPart().P.then(function (e) {
            var html = renderer_1.render(e);
            var container = document.getElementById('submissions');
            if (container && html) {
                container.innerHTML = '';
                container.appendChild(html);
            }
        });
    };
    SubmissionsOverview.prototype.CreateAsyncPart = function () {
        var part = {
            I: 'submissions',
            P: this.GetSubmissions().then(function (submissions) {
                if (!submissions) {
                    var empty = {
                        e: ['div', 'no submissions found']
                    };
                    return empty;
                }
                var lines = new Array();
                var _loop_1 = function (submission) {
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td', submission.submission_id.toString(10)],
                                a: [[renderer_1.A.Class, 'u hand']],
                                v: [[renderer_1.EventType.Click, function (e) { return router_1.navigate(_admin_link_creator_1.AdminLink.EditSubmission(submission.video_id, submission.submission_id), e); }]]
                            },
                            {
                                e: ['td', submission.video_title ? submission.video_title : 'no title']
                            },
                            {
                                e: ['td', submission.user_name ? submission.user_name : 'no username']
                            },
                            {
                                e: ['td', submission.latest ? 'latest submission' : '']
                            },
                            {
                                e: ['td', typeof (submission.submission_type) === 'number' ? enum_to_string_converters_1.convertSubmissionTypeToString(submission.submission_type) : '']
                            }
                        ]
                    });
                };
                for (var _i = 0, submissions_1 = submissions; _i < submissions_1.length; _i++) {
                    var submission = submissions_1[_i];
                    _loop_1(submission);
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
                                            e: ['th', 'Title']
                                        },
                                        {
                                            e: ['th', 'Username']
                                        },
                                        {
                                            e: ['th', 'Latest']
                                        },
                                        {
                                            e: ['th', 'Type']
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
        return part;
    };
    SubmissionsOverview.prototype.GetSubmissions = function () {
        return http_1.get("/Admin/Submissions/" + this.limit.toString(10) + "/" + this.offset.toString(10));
    };
    SubmissionsOverview.RegisterPage = function () {
        var page = {
            Component: SubmissionsOverview,
            Title: 'Submissions',
            Url: ['Admin', 'Submissions']
        };
        router_1.registerPage(page);
    };
    return SubmissionsOverview;
}());
exports.SubmissionsOverview = SubmissionsOverview;
//# sourceMappingURL=submissions_overview.js.map