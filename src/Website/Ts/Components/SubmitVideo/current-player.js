import { SubmitVideoPage } from "../../pages/submit-video.js"
import { Render, Div, t, id, cl } from "../../Framework/renderer";
import { addClassIfNotExists, removeClassIfExists } from "../../Framework/browser";

/**
 * renders the 'Player: 1|2' section into the container with the provided ID
 * @constructor
 * @param {SubmitVideoPage} caller - the 'this' context from the page handler
 * @param {string} containerId - the container the html will be rendered into
 * @param {function(number):*} subscriberFunction - function will be called whenever the player is changed
 */
export function CurrentPlayer(caller, containerId, subscriberFunction) {

    this.caller = caller;
    this.subscriberFunction = subscriberFunction;

    new Render([
        Div(
            t('Player: 1'),
            id('current-player-container'),
            cl('hand', 'display-none'),
            event('click', e => this.changePlayer(e))
        )
    ], containerId, true, false);
}

CurrentPlayer.prototype = {

    /**
     * changes the player and notifies the subscriber
     * @param {any} e
     */
    changePlayer: function(e) {
        const target = e.target;
        if (target.id === 'current-player-container') {
            if (target.innerText === 'Player: 1') {
                addClassIfNotExists(target, 'change-player-container-modifier');
                target.innerText = 'Player: 2'
                this.subscriberFunction.call(this.caller, 2);
            } else {
                removeClassIfExists(target, 'change-player-container-modifier');
                target.innerText = 'Player: 1';
                this.subscriberFunction.call(this.caller, 1);
            }
        }
    }
}

