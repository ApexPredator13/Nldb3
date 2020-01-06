import { Html, Div, id, p, t, br, span, div, textarea, attr, event, button } from "../../Framework/renderer";
import { post } from "../../Framework/http";
import { disableButton, enableButton } from "../../Framework/browser";

/**
 * The "Submit Topic" section of the submit video page
 * @constructor
 * @param {string} containerId - the container into which the component will be rendered into
 * @param {string} videoId - the ID of the youtube Video
 */
function SubmitTopicSection(containerId, videoId) {
    this.videoId = videoId;
    this.textarea = null;
    this.interval = null;
    this.submitButton = null;
    this.intervalCounter = 15;
    this.canSubmit = true;
    this.submitTopicCounter = null;

    new Html([
        Div(
            id('submit-topic-container'),

            p(
                t('Did NL talk about a topic for a while?'),
                br(),
                t('Submit interesting topics here!'),
                span(
                    t(' (0/100)'),
                    id('submit-topic-counter')
                )
            ),
            div(
                textarea(
                    attr({
                        id: 'submit-topic-textarea',
                        maxlength: '100',
                        rows: '2',
                        cols: '20',
                        placeholder: 'Topics, Tangents, Events, Artists...'
                    }),
                    event('input', () => {
                        this.validateInput();
                        this.updateCounter();
                    })
                )
            ),
            div(
                button(
                    t('Submit'),
                    attr({
                        id: 'submit-topic-button',
                        disabled: 'true'
                    }),
                    event('click', e => this.submitTopic(e))
                )
            )
        )
    ], containerId, true, false);
}

SubmitTopicSection.prototype = {

    getTextarea: function () {
        if (this.textarea) {
            return this.textarea;
        }
        this.textarea = document.getElementById('submit-topic-textarea');
        return this.textarea;
    },

    submitTopic: function (e) {
        e.preventDefault();

        if (!this.canSubmit) {
            return;
        }

        const textarea = this.getTextarea();
        this.canSubmit = false;
        disableButton(this.getSubmitButton());

        post('/Api/Topics', JSON.stringify({ VideoId: this.videoId, Topic: textarea.value }), true).then(() => {
            textarea.value = '';
            this.interval = setInterval(function () {
                this.intervalCounter--;
                this.getTextareaCounter().innerText = " (" + this.intervalCounter + "...)";
                if (this.intervalCounter === 0) {
                    this.intervalCounter = 15;
                    clearInterval(this.interval);
                    this.canSubmit = true;
                    this.getTextareaCounter().innerText = " (" + textarea.value.length.toString(10) + "/100)";
                }
            }.bind(this), 1000);
        }).catch(function () { return _this.canSubmit = true; });
    },

    getSubmitButton: function () {
        if (this.submitButton) {
            return this.submitButton;
        }
        this.submitButton = document.getElementById('submit-topic-button');
        return this.submitButton;
    },

    getTextareaCounter: function () {
        if (this.submitTopicCounter) {
            return this.submitTopicCounter;
        }
        this.submitTopicCounter = document.getElementById('submit-topic-counter');
        return this.submitTopicCounter;
    },

    updateCounter: function () {
        var counter = this.getTextareaCounter();
        var textarea = this.getTextarea();
        counter.innerText = " (" + textarea.value.length.toString(10) + "/100)";
    },

    validateInput: function () {
        var textarea = this.getTextarea();
        if (textarea && textarea.value.length < 5) {
            disableButton(this.getSubmitButton());
            return false;
        }
        enableButton(this.getSubmitButton());
        return true;
    }
}


export {
    SubmitTopicSection
}