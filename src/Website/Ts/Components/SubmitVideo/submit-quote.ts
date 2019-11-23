import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { Option } from '../General/option';
import { post } from "../../Framework/http";

export class SubmitQuote implements Component {
    E: FrameworkElement;

    private quotesTextareaCounter: HTMLSpanElement | undefined;
    private submitButton: HTMLButtonElement | undefined;
    private textarea: HTMLTextAreaElement | undefined;
    private selectedMinute: HTMLSelectElement | undefined;
    private selectedSecond: HTMLSelectElement | undefined;
    private specificTimeRadio: HTMLInputElement | undefined;

    private canEnableSubmitButton = true;
    private interval: number | undefined;
    private intervalCounter = 15;

    constructor(private videoId: string) {
        this.E = {
            e: ['div'],
            a: [[A.Id, 'quotes']],
            c: [
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Did NL say something interesting/funny? Submit a quote here: ']
                        },
                        {
                            e: ['span', '(0/300 characters)'],
                            a: [[A.Id, 'quotes-textarea-counter']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Id, 'quotes-textarea-wrapper']],
                    c: [
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['textarea'],
                                    a: [[A.Id, 'quotes-textarea'], [A.MaxLength, '300'], [A.Cols, '30'], [A.Rows, '4']],
                                    v: [[EventType.Input, e => { this.TextareaTypeEvent(e); this.CheckQuoteValid(); }]]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['span', 'Quote started at:']
                                },
                                {
                                    e: ['br']
                                },
                                {
                                    e: ['input'],
                                    a: [[A.Type, 'radio'], [A.Id, 'current-video-timer'], [A.Name, 'quote-time-type']],
                                    v: [[EventType.Input, () => { this.ResetSpecificTimeSelection(); this.CheckQuoteValid(); }]]
                                },
                                {
                                    e: ['span', 'Current video time']
                                },
                                {
                                    e: ['br']
                                },
                                {
                                    e: ['input'],
                                    a: [[A.Type, 'radio'], [A.Id, 'exact-time'], [A.Selected, 'true'], [A.Name, 'quote-time-type']],
                                    v: [[EventType.Input, () => this.CheckQuoteValid()]]
                                },
                                {
                                    e: ['select'],
                                    a: [[A.Id, 'select-minute']],
                                    v: [[EventType.Input, () => { this.CheckSpecificTimeRadio(); this.CheckQuoteValid(); }]],
                                    c: [
                                        new Option('-', '', true),
                                        ...Array.from(Array(180).keys()).map(index => new Option(index.toString(10), index.toString(10)))
                                    ]
                                },
                                {
                                    e: ['span', 'Minutes']
                                },
                                {
                                    e: ['select'],
                                    a: [[A.Id, 'select-second']],
                                    v: [[EventType.Input, () => { this.CheckSpecificTimeRadio(); this.CheckQuoteValid(); }]],
                                    c: [
                                        new Option('-', '', true),
                                        ...Array.from(Array(59).keys()).map(index => new Option((index + 1).toString(10), (index + 1).toString(10)))
                                    ]
                                },
                                {
                                    e: ['span', 'Seconds']
                                }
                            ]
                        }
                    ]
                },
                {
                    e: ['button', 'Submit Quote'],
                    a: [[A.Id, 'submit-quote-button'], [A.Disabled, 'true']],
                    v: [[EventType.Click, e => this.SubmitQuote(e)]]
                }
            ]
        }
    }

    private TextareaTypeEvent(e: Event) {
        const target = e.target;
        if (!target || !(target instanceof HTMLTextAreaElement)) {
            return;
        }

        let textareaCounter: HTMLSpanElement;

        if (this.quotesTextareaCounter) {
            textareaCounter = this.quotesTextareaCounter;
        } else {
            const element = document.getElementById('quotes-textarea-counter');
            if (!element || !(element instanceof HTMLSpanElement)) {
                return;
            }
            this.quotesTextareaCounter = element;
            textareaCounter = element;
        }

        const typedCharacters = target.value.length;

        if (typedCharacters > 10) {
            this.EnableSubmitButton();
        } else {
            this.DisableSubmitButton();
        }

        textareaCounter.innerText = `(${typedCharacters}/300 characters)`;
    }

    private CheckQuoteValid(): boolean {
        const specificTimeRadio = this.GetSpecificTimeRadio();
        const minuteSelection = this.GetMinuteSelectElement();
        const secondSelection = this.GetSecondSelectElement();

        if (specificTimeRadio.checked && (!minuteSelection.value || !secondSelection.value)) {
            this.DisableSubmitButton();
            return false;
        }

        const textarea = this.GetTextarea();
        if (textarea.value.length < 10) {
            this.DisableSubmitButton();
            return false;
        }

        this.EnableSubmitButton();
        return true;
    }

    private ResetSpecificTimeSelection() {
        const minute = this.GetMinuteSelectElement();
        const second = this.GetSecondSelectElement();
        minute.selectedIndex = 0;
        second.selectedIndex = 0;
    }

    private CheckSpecificTimeRadio() {
        const radio = document.getElementById('exact-time');
        if (radio && radio instanceof HTMLInputElement) {
            radio.checked = true;
        }
    }

    private DisableSubmitButton() {
        this.GetSubmitButton().disabled = true;
    }

    private EnableSubmitButton() {
        if (this.canEnableSubmitButton) {
            this.GetSubmitButton().disabled = false;
        }
    }

    private GetSubmitButton(): HTMLButtonElement {
        if (this.submitButton) {
            return this.submitButton;
        } else {
            const button = document.getElementById('submit-quote-button');
            if (!button || !(button instanceof HTMLButtonElement)) {
                throw 'no quotes submit button found!';
            }
            this.submitButton = button;
            return button;
        }
    }

    private SubmitQuote(e: Event) {
        e.preventDefault();

        const textarea = this.GetTextarea();
        const specificTimeRadio = this.GetSpecificTimeRadio();

        let at = 0;

        const minuteSelect = this.GetMinuteSelectElement();
        const secondSelect = this.GetSecondSelectElement();

        if (specificTimeRadio.checked) {
            at = (parseInt(minuteSelect.value, 10) * 60) + (parseInt(secondSelect.value, 10));
        } else {
            at = (window as any).youtubePlayer.getCurrentTime();
        }

        const data = new FormData();
        data.append('VideoId', this.videoId);
        data.append('Content', textarea.value);
        data.append('At', at.toString(10));

        const valid = this.CheckQuoteValid();
        if (valid) {
            this.canEnableSubmitButton = false;
            post('/Api/Quotes').then(() => {
                textarea.value = '';
                minuteSelect.selectedIndex = 0;
                secondSelect.selectedIndex = 0;
                this.canEnableSubmitButton = false;
                this.interval = setInterval(() => {
                    this.intervalCounter--;
                    if (this.intervalCounter === 0) {
                        clearInterval(this.interval);
                        this.intervalCounter = 15;
                        this.canEnableSubmitButton = true;
                    }
                }, 1000);
            }).catch(() => this.canEnableSubmitButton = true);
        }
    }

    private GetTextarea(): HTMLTextAreaElement {
        if (this.textarea) {
            return this.textarea;
        } else {
            const textarea = document.getElementById('quotes-textarea');
            if (!textarea || !(textarea instanceof HTMLTextAreaElement)) {
                throw 'no quotes textarea found!';
            }
            this.textarea = textarea;
            return textarea;
        }
    }

    private GetSpecificTimeRadio(): HTMLInputElement {
        if (this.specificTimeRadio) {
            return this.specificTimeRadio;
        } else {
            const radio = document.getElementById('exact-time');
            if (!radio || !(radio instanceof HTMLInputElement)) {
                throw 'no specific time radio found';
            }
            this.specificTimeRadio = radio;
            return radio;
        }
    }

    private GetMinuteSelectElement(): HTMLSelectElement {
        if (this.selectedMinute) {
            return this.selectedMinute;
        } else {
            const minute = document.getElementById('select-minute');
            if (!minute || !(minute instanceof HTMLSelectElement)) {
                throw 'no minute selection found';
            }
            this.selectedMinute = minute;
            return minute;
        }
    }

    private GetSecondSelectElement(): HTMLSelectElement {
        if (this.selectedSecond) {
            return this.selectedSecond;
        } else {
            const second = document.getElementById('select-second');
            if (!second || !(second instanceof HTMLSelectElement)) {
                throw 'no second selection found';
            }
            this.selectedSecond = second;
            return second;
        }
    }
}


