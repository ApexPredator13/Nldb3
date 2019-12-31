import { Html, Div, id, p, t, span, div, textarea, attr, br, input, select, option, button } from "../../Framework/renderer";
import { post } from "../../Framework/http";
import { YoutubePlayer } from "./youtube-player";

/**
 * handler for submitting quotes while the video is playing
 * @constructor
 * @param {string} containerId - the id of the container the 'submit quote' section will be rendered into
 * @param {string} videoId - the id of the youtube video
 * @param {YoutubePlayer} youtubePlayer - the youtube player
 */
export function SubmitVideoQuotesSection(containerId, videoId, youtubePlayer) {

    this.textareaCounter = null;
    this.submitButton = null;
    this.textarea = null;
    this.selectedMinute = null;
    this.selectedSecond = null;
    this.specificTimeRadio = null;
    this.videoTimeRadio = null;

    this.youtubePlayer = youtubePlayer;
    this.videoId = videoId;
    this.canEnableSubmitButton = false;
    this.interval = null;
    this.intervalCounter = 15;


    /**
     * processes the textarea inputs
     * @param {Event} e - the raw input event
     */
    this.textareaTypeEvent = function (e) {
        const textarea = e.target;

        if (!this.textareaCounter) {
            this.textareaCounter = document.getElementById('quotes-textarea-counter');
        }

        const typedCharacters = textarea.value.length;

        if (typedCharacters > 10) {
            this.enableSubmitButton();
        } else {
            this.disableSubmitButton();
        }

        this.textareaCounter.innerText = `(${typedCharacters}/300 characters)`;
    }

    /**
     * checks whether the quote and the selected time value is valid or not
     * @returns {boolean}
     */
    this.checkQuoteValid = function () {
        const videoTimeRadio = this.getVideoTimeRadio();
        const specificTimeRadio = this.getSpecificTimeRadio();
        const minuteSelection = this.getMinuteSelectElement();
        const secondSelection = this.getSecondSelectElement();

        if (!videoTimeRadio.checked && !specificTimeRadio.checked) {
            this.disableSubmitButton();
            return false;
        }

        if (specificTimeRadio.checked && (!minuteSelection.value || !secondSelection.value)) {
            this.disableSubmitButton();
            return false;
        }

        const textarea = this.getTextarea();
        if (textarea.value.length < 10) {
            this.disableSubmitButton();
            return false;
        }

        this.enableSubmitButton();
        return true;
    }

    /** resets the 'specific time' select elements */
    this.resetSpecificTimeSelection = function() {
        const minute = this.getMinuteSelectElement();
        const second = this.getSecondSelectElement();
        minute.selectedIndex = 0;
        second.selectedIndex = 0;
    }

    /** checks the 'specific time' radio */
    this.checkSpecificTimeRadio = function () {
        document.getElementById('exact-time').checked = true;
    }

    /** disables the 'submit quote' button */
    this.disableSubmitButton = function() {
        this.getSubmitButton().disabled = true;
    }
    
    /** enables the 'submit quote' button */
    this.enableSubmitButton = function() {
        if (this.canEnableSubmitButton) {
            this.getSubmitButton().disabled = false;
        }
    }

    /**
     * gets, caches and returns the submit button
     * @returns {HTMLButtonElement}
     */
    this.getSubmitButton = function() {
        if (this.submitButton) {
            return this.submitButton;
        } else {
            this.submitButton = document.getElementById('submit-quote-button');
            return this.submitButton;
        }
    }

    /**
     * gets, caches and returns the textarea element
     * @returns {HTMLTextAreaElement}
     */
    this.getTextarea = function() {
        if (this.textarea) {
            return this.textarea;
        } else {
            this.textarea = document.getElementById('quotes-textarea');
            return this.textarea;
        }
    }

    /**
     * gets, caches and returns the 'specific time' radio button
     * @returns {HTMLInputElement}
     */
    this.getSpecificTimeRadio = function() {
        if (this.specificTimeRadio) {
            return this.specificTimeRadio;
        } else {
            this.specificTimeRadio = document.getElementById('exact-time');
            return this.specificTimeRadio;
        }
    }

    /**
    * gets, caches and returns the 'current video time' radio button
    * @returns {HTMLInputElement}
    */
    this.getVideoTimeRadio = function() {
        if (this.videoTimeRadio) {
            return this.videoTimeRadio;
        } else {
            this.videoTimeRadio = document.getElementById('current-video-timer');
            return this.videoTimeRadio;
        }
    }

    /**
    * gets, caches and returns the minute select element
    * @returns {HTMLSelectElement}
    */
    this.getMinuteSelectElement = function() {
        if (this.selectedMinute) {
            return this.selectedMinute;
        } else {
            this.selectedMinute = document.getElementById('select-minute');
            return this.selectedMinute;
        }
    }

    /**
    * gets, caches and returns the seconds select element
    * @returns {HTMLSelectElement}
    */
    this.getSecondSelectElement = function() {
        if (this.selectedSecond) {
            return this.selectedSecond;
        } else {
            this.selectedSecond = document.getElementById('select-second');
            return this.selectedSecond;
        }
    }

    /**
     * submits the quote
     * @param {Event} e - the raw 'submit' event
     */
    this.submitQuote = function(e) {
        e.preventDefault();

        const textarea = this.getTextarea();
        const specificTimeRadio = this.getSpecificTimeRadio();

        let at = 0;

        const minuteSelect = this.getMinuteSelectElement();
        const secondSelect = this.getSecondSelectElement();

        if (specificTimeRadio.checked) {
            at = (parseInt(minuteSelect.value, 10) * 60) + (parseInt(secondSelect.value, 10));
        } else {
            at = this.youtubePlayer.GetCurrentTime();
        }

        const data = new FormData();
        data.append('VideoId', this.videoId);
        data.append('Content', textarea.value);
        data.append('At', at.toString(10));

        const valid = this.checkQuoteValid();

        if (valid) {
            this.disableSubmitButton();
            this.canEnableSubmitButton = false;

            post('/Api/Quotes', data).then(() => {

                textarea.value = '';
                minuteSelect.selectedIndex = 0;
                secondSelect.selectedIndex = 0;
                const radio1 = this.getSpecificTimeRadio();
                radio1.checked = false;
                const radio2 = this.getVideoTimeRadio();
                radio2.checked = false;
                this.canEnableSubmitButton = false;

                this.interval = setInterval(() => {
                    this.intervalCounter--;
                    const button = this.getSubmitButton();
                    button.innerText = `Quote Submitted! (Waiting... ${this.intervalCounter.toString(10)})`;
                    if (this.intervalCounter === 0) {
                        button.innerText = 'Submit Quote';
                        clearInterval(this.interval);
                        this.intervalCounter = 15;
                        this.canEnableSubmitButton = true;
                        this.disableSubmitButton();
                    }
                }, 1000);
            }).catch(() => { this.canEnableSubmitButton = true; this.enableSubmitButton(); });
        }
    }


    // renders the initial HTML layout
    new Html([
        Div(
            id('quotes'),

            p(
                t('Did NL say something interesting/funny? Submit a quote here: '),
                span(
                    t('(0/300 characters)'),
                    id('quotes-textarea-counter')
                )
            ),
            div(
                id('quotes-textarea-wrapper'),

                div(
                    textarea(
                        attr({ id: 'quotes-textarea', maxlength: '300', cols: '30', rows: '4' }),
                        event('input', e => { this.textareaTypeEvent(e); this.checkQuoteValid() })
                    )
                ),
                div(
                    id('quotes-textarea-wrapper'),

                    div(
                        id('quote-started-at-container'),

                        span(
                            t('Quote started at:')
                        ),
                        br(),
                        input(
                            attr({ type: 'radio', id: 'current-video-timer', name: 'quote-time-type' }),
                            event('input', () => { this.resetSpecificTimeSelection(); this.checkQuoteValid(); })
                        ),
                        span(
                            t('Current video time')
                        ),
                        br(),
                        input(
                            attr({ type: 'radio', id: 'exact-time', selected: 'true', name: 'quote-time-type' })
                        ),
                        select(
                            id('select-minute'),
                            event('input', () => { this.checkSpecificTimeRadio(); this.checkQuoteValid(); }),
                            option('', '', true),
                            ...Array.from(Array(180).keys()).map(index => option(index.toString(10), index.toString(10)))
                        ),
                        span(
                            t('Minutes')
                        ),
                        select(
                            id('select-second'),
                            event('input', () => { this.checkSpecificTimeRadio(); this.checkQuoteValid(); }),
                            option('', '', true),
                            ...Array.from(Array(59).keys()).map(index => option((index + 1).toString(10), (index + 1).toString(10)))
                        ),
                        span(
                            t('Seconds')
                        )
                    )
                )
            ),
            button(
                t('Submit Quote'),
                attr({ id: 'submit-quote-button', disabled: 'true' }),
                event('click', this.submitQuote)
            )
        )
    ], containerId, true, false);
}

