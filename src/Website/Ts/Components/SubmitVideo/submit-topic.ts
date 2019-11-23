import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { post } from "../../Framework/http";

export class SubmitTopic implements Component {
    E: FrameworkElement;

    private textarea: HTMLTextAreaElement | undefined;
    private submitButton: HTMLButtonElement | undefined;
    private submitTopicCounter: HTMLSpanElement | undefined;
    private canSubmit = true;
    private interval: number | undefined;
    private intervalCounter = 15;

    constructor(private videoId: string) {
        this.E = {
            e: ['div'],
            a: [[A.Id, 'submit-topic-container']],
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
                            a: [[A.Id, 'submit-topic-counter']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['textarea'],
                            a: [
                                [A.Id, 'submit-topic-textarea'],
                                [A.MaxLength, '100'],
                                [A.Rows, '2'],
                                [A.Cols, '20'],
                                [A.Placeholder, 'Topics, Tangents, Events, Artists...']
                            ],
                            v: [[EventType.Input, () => { this.ValidateInput(); this.UpdateCounter(); }]]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['button', 'Submit'],
                            a: [[A.Id, 'submit-topic-button'], [A.Disabled, 'true']],
                            v: [[EventType.Click, e => this.SubmitTopic(e)]]
                        }
                    ]
                }
            ]
        }
    }

    private GetTextarea() {
        if (this.textarea) {
            return this.textarea;
        }

        const textarea = document.getElementById('submit-topic-textarea');
        if (!textarea || !(textarea instanceof HTMLTextAreaElement)) {
            throw 'topic textarea not found';
        }

        this.textarea = textarea;
        return textarea;
    }

    private SubmitTopic(e: Event) {
        e.preventDefault();

        if (!this.canSubmit) {
            return;
        }

        const textarea = this.GetTextarea();

        const formData = new FormData();
        formData.append('video_id', this.videoId)
        formData.append('topic', textarea.value);

        const canSubmit = this.ValidateInput();
        if (!canSubmit) {
            return;
        }

        this.canSubmit = false;
        this.DisableButton();

        post('/Api/Topics', formData, true).then(() => {
            textarea.value = '';
            this.interval = setInterval(() => {
                this.intervalCounter--;
                this.GetTextareaCounter().innerText = ` (${this.intervalCounter}...)`;
                if (this.intervalCounter === 0) {
                    this.intervalCounter = 15;
                    clearInterval(this.interval);
                    this.canSubmit = true;
                    this.GetTextareaCounter().innerText = ` (${textarea.value.length.toString(10)}/100)`;
                }
            }, 1000);
        }).catch(() => this.canSubmit = true);
    }

    private GetSubmitButton() {
        if (this.submitButton) {
            return this.submitButton;
        }

        const button = document.getElementById('submit-topic-button');
        if (!button || !(button instanceof HTMLButtonElement)) {
            throw 'submit topic button not found!';
        }

        this.submitButton = button;
        return button;
    }

    private EnableButton() {
        if (this.canSubmit) {
            this.GetSubmitButton().disabled = false;
        }
    }

    private DisableButton() {
        this.GetSubmitButton().disabled = true;
    }

    private GetTextareaCounter() {
        if (this.submitTopicCounter) {
            return this.submitTopicCounter;
        }

        const counter = document.getElementById('submit-topic-counter');
        if (!counter || !(counter instanceof HTMLSpanElement)) {
            throw 'submit topic counter element not found';
        }

        this.submitTopicCounter = counter;
        return counter;
    }

    private UpdateCounter() {
        const counter = this.GetTextareaCounter();
        const textarea = this.GetTextarea();
        counter.innerText = ` (${textarea.value.length.toString(10)}/100)`;
    }

    private ValidateInput() {
        const textarea = this.GetTextarea();
        if (textarea && textarea.value.length < 5) {
            this.DisableButton();
            return false;
        }
        this.EnableButton();
        return true;
    }
}


