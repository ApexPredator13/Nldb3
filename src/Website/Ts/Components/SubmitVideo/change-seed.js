import { SubmitVideoPage } from "../../Pages/submit-video.js"
import { Html, Div, id, cl, event, h2, t, hr, p, input, attr, button, formButton, hideModal, form, modal } from "../../Framework/renderer";
import { addClassIfNotExists, removeClassIfExists } from "../../Framework/browser";
import { FormHelper } from "../../Framework/forms";
import { YoutubePlayer } from "./youtube-player";
import { HistoryTable } from "./history-table";


/**
 * renders the 'Change Seed' / 'Current Seed' section into the container with the provided ID
 * @constructor
 * @param {SubmitVideoPage} caller - the THIS context of the page handler
 * @param {string} containerId - the ID of the container the HTML will be rendered into
 * @param {YoutubePlayer} youtubePlayer - the youtube player instance
 * @param {function():*} subscriberFunction - the callback function that should be called whenever a new seed was selected
 * @param {HistoryTable} history - the current history table
 */
function ChangeSeed(caller, containerId, youtubePlayer, subscriberFunction, history) {

    this.seedFormHelper = new FormHelper();
    this.youtubePlayer = youtubePlayer;
    this.subscriberFunction = subscriberFunction;
    this.history = history;
    this.caller = caller;

    new Html([
        Div(
            id('seed-container'),
            cl('hand', 'display-none'),
            event('click', () => {

                // hack: keyboard input events don't get removed for some reason...
                var container = document.getElementById('menu-container');
                console.log('menu container: ', container);
                console.log('event listener: ', window.boundEventListener);

                if (container && window.boundEventListener) {
                    container.removeEventListener('keydown', window.boundEventListener);
                    window.boundEventListener = null;
                }
                // end of hack

                this.youtubePlayer.pauseVideo();
                modal(false, this.createModalContent())
            })
        )
    ], containerId, true, false);
}



ChangeSeed.prototype = {

    /**
     * updates the seed text on the top of the page: Seed: XXXX XXXX or 'Enter Seed'
     * @param {string|null} seed
     */
    updateSeedText: function(seed) {
        const seedDiv = document.getElementById('seed-container');
        if (seed) {
            seedDiv.innerText = 'Seed: ' + seed;
        } else {
            seedDiv.innerText = 'Enter seed';
        }
    },


    /** hides the seed input element */
    hideSeedInputElement: function() {
        const seedContainer = document.getElementById('seed-container');
        seedContainer.innerText = '';
        addClassIfNotExists(seedContainer, 'display-none');
    },


    /** displays the seed input element */
    showSeedInputElement: function() {
        const seedContainer = document.getElementById('seed-container');
        const seed = this.history.getSeed();
        seedContainer.innerText = seed ? `Seed: ${seed}` : 'Enter seed';
        removeClassIfExists(seedContainer, 'display-none');
    },


    /**
     * saves the seed and notifies the subscriberFunction that the seed was changed
     * @param {(string|null)} seed
     */
    seedWasSelected: function (seed) {
        this.history.addSeed(seed ? seed : null);
        this.updateSeedText(seed);
        this.subscriberFunction.call(this.caller);
    },


    /** creates the HTML for the modal */
    createModalContent: function () {

        // removing cached form element because form gets recreated now
        this.seedFormHelper.form = null;

        const existingSeed = this.history.getSeed();
        const seed1 = existingSeed ? existingSeed.substring(0, 4) : '';
        const seed2 = existingSeed ? existingSeed.substring(4) : '';

        return Div(
            h2(
                t('Change Seed?')
            ),
            hr(),
            form(
                event('submit', e => {
                    e.preventDefault();
                    const seed = document.getElementById('seed1').value + document.getElementById('seed2').value;
                    this.seedWasSelected(seed);
                    hideModal();
                    this.youtubePlayer.playVideo();
                }),

                p(
                    input(
                        attr({
                            type: 'text',
                            id: 'seed1',
                            size: '4',
                            spellcheck: 'false',
                            value: seed1,
                            minlength: '4',
                            maxlength: '4',
                            required: 'true'
                        }),
                        event('input', e => {
                            e.target.value = e.target.value.toUpperCase();
                            this.seedFormHelper.validateForm(e);
                        })
                    ),
                    input(
                        attr({
                            type: 'text',
                            id: 'seed2',
                            value: seed2,
                            size: '4',
                            spellcheck: 'false',
                            minlength: '4',
                            maxlength: '4',
                            required: 'true'
                        }),
                        event('input', e => {
                            e.target.value = e.target.value.toUpperCase();
                            this.seedFormHelper.validateForm(e);
                        })
                    )
                ),
                p(
                    formButton(
                        t('Use this seed'),
                    ),
                    button(
                        t('Remove Seed'),
                        event('click', e => {
                            e.preventDefault();
                            this.history.addSeed(null);
                            this.updateSeedText(null);
                            hideModal();
                            this.youtubePlayer.playVideo();
                        })
                    ),
                    button(
                        t('Cancel'),
                        event('click', e => {
                            e.preventDefault();
                            hideModal();
                            this.youtubePlayer.playVideo();
                        })
                    )
                )
            )
        );
    }
}


export {
    ChangeSeed
}