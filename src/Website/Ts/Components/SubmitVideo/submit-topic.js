"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("../../Framework/renderer");
var http_1 = require("../../Framework/http");
var SubmitTopic = /** @class */ (function () {
    function SubmitTopic(videoId) {
        var _this = this;
        this.videoId = videoId;
        this.canSubmit = true;
        this.intervalCounter = 15;
        this.E = {
            e: ['div'],
            a: [[renderer_1.A.Id, 'submit-topic-container']],
            c: [
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Did NL talk about a topic for a while?']
                        },
                        {
                            e: ['br']
                        },
                        {
                            e: ['span', 'Submit interesting topics here!']
                        },
                        {
                            e: ['span', ' (0/100)'],
                            a: [[renderer_1.A.Id, 'submit-topic-counter']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['textarea'],
                            a: [
                                [renderer_1.A.Id, 'submit-topic-textarea'],
                                [renderer_1.A.MaxLength, '100'],
                                [renderer_1.A.Rows, '2'],
                                [renderer_1.A.Cols, '20'],
                                [renderer_1.A.Placeholder, 'Topics, Tangents, Events, Artists...']
                            ],
                            v: [[renderer_1.EventType.Input, function () { _this.ValidateInput(); _this.UpdateCounter(); }]]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['button', 'Submit'],
                            a: [[renderer_1.A.Id, 'submit-topic-button'], [renderer_1.A.Disabled, 'true']],
                            v: [[renderer_1.EventType.Click, function (e) { return _this.SubmitTopic(e); }]]
                        }
                    ]
                }
            ]
        };
    }
    SubmitTopic.prototype.GetTextarea = function () {
        if (this.textarea) {
            return this.textarea;
        }
        var textarea = document.getElementById('submit-topic-textarea');
        if (!textarea || !(textarea instanceof HTMLTextAreaElement)) {
            throw 'topic textarea not found';
        }
        this.textarea = textarea;
        return textarea;
    };
    SubmitTopic.prototype.SubmitTopic = function (e) {
        var _this = this;
        e.preventDefault();
        if (!this.canSubmit) {
            return;
        }
        var textarea = this.GetTextarea();
        var canSubmit = this.ValidateInput();
        if (!canSubmit) {
            return;
        }
        this.canSubmit = false;
        this.DisableButton();
        http_1.post('/Api/Topics', JSON.stringify({ VideoId: this.videoId, Topic: textarea.value }), true).then(function () {
            textarea.value = '';
            debugger;
            _this.interval = setInterval(function () {
                _this.intervalCounter--;
                _this.GetTextareaCounter().innerText = " (" + _this.intervalCounter + "...)";
                if (_this.intervalCounter === 0) {
                    _this.intervalCounter = 15;
                    clearInterval(_this.interval);
                    _this.canSubmit = true;
                    _this.GetTextareaCounter().innerText = " (" + textarea.value.length.toString(10) + "/100)";
                }
            }, 1000);
        }).catch(function () { return _this.canSubmit = true; });
    };
    SubmitTopic.prototype.GetSubmitButton = function () {
        if (this.submitButton) {
            return this.submitButton;
        }
        var button = document.getElementById('submit-topic-button');
        if (!button || !(button instanceof HTMLButtonElement)) {
            throw 'submit topic button not found!';
        }
        this.submitButton = button;
        return button;
    };
    SubmitTopic.prototype.EnableButton = function () {
        if (this.canSubmit) {
            this.GetSubmitButton().disabled = false;
        }
    };
    SubmitTopic.prototype.DisableButton = function () {
        this.GetSubmitButton().disabled = true;
    };
    SubmitTopic.prototype.GetTextareaCounter = function () {
        if (this.submitTopicCounter) {
            return this.submitTopicCounter;
        }
        var counter = document.getElementById('submit-topic-counter');
        if (!counter || !(counter instanceof HTMLSpanElement)) {
            throw 'submit topic counter element not found';
        }
        this.submitTopicCounter = counter;
        return counter;
    };
    SubmitTopic.prototype.UpdateCounter = function () {
        var counter = this.GetTextareaCounter();
        var textarea = this.GetTextarea();
        counter.innerText = " (" + textarea.value.length.toString(10) + "/100)";
    };
    SubmitTopic.prototype.ValidateInput = function () {
        var textarea = this.GetTextarea();
        if (textarea && textarea.value.length < 5) {
            this.DisableButton();
            return false;
        }
        this.EnableButton();
        return true;
    };
    return SubmitTopic;
}());
exports.SubmitTopic = SubmitTopic;
//# sourceMappingURL=submit-topic.js.map