import { Html, Div, id, span, t, attr, event, input } from "../../Framework/renderer";
import { YoutubePlayer } from "./youtube-player";


/**
 * initializes youtube player controls (from outside the player)
 * @constructor
 * @param {string} containerId - the container ID the controls will be rendered into
 * @param {YoutubePlayer} youtubePlayer - the youtube player instance
 */
function PlayerControls(containerId, youtubePlayer) {

    window.playerInterval = null;

    /** @type {YoutubePlayer} */
    this.youtubePlayer = youtubePlayer;

    // renders the initial HTML
    new Html([
        Div(
            id('player-controls'),

            span(
                t('⏪'),
                attr({ id: 'rewind', class: 'hand', title: 'Go back 5 seconds' }),
                event('click', () => this.rewindClicked())
            ),
            span(
                t('▶️'),
                attr({ id: 'play-pause', class: 'hand', title: 'Play / Pause' }),
                event('click', () => this.playPauseClicked())
            ),
            input(
                attr({
                    type: 'checkbox'
                }),
                event('input', e => {
                    if (e.target.checked) {
                        this.autopause = true;
                    } else {
                        this.autopause = false;
                    }
                })
            )
        )
    ], containerId, true, false);


    // refreshes the play/pause icon every 5 seconds - should it ever get out of sync
    window.playerInterval = setInterval(() => {
        try {
            this.setPlayPauseIcon();
        } catch (e) {
            // will clear the interval when the 'play-pause' element is gone
            clearInterval(window.playerInterval);
            window.playerInterval = null;
        }
    }, 5000);
}




PlayerControls.prototype = {

    /** rewinds back 5 seconds  */
    rewindClicked: function() {
        this.youtubePlayer.seek(-5);
    },


    /** enables auto-pause */
    autopause: false,


    /** plays / pauses the video */
    playPauseClicked: function () {
        const currentState = this.youtubePlayer.getPlayerState();
        if (currentState === 1) {
            this.youtubePlayer.pauseVideo();
        } else {
            this.youtubePlayer.playVideo();
        }

        setTimeout(() => this.setPlayPauseIcon(), 100);
    },


    /** sets the play/pause span to ⏸️ or ▶️ after it was clicked */
    setPlayPauseIcon: function() {
        const currentState = this.youtubePlayer.getPlayerState();
        const playPause = document.getElementById('play-pause');

        if (currentState === 1) {
            playPause.innerText = '⏸️';
        } else {
            playPause.innerText = '▶️';
        }
    }
}


export {
    PlayerControls
}


