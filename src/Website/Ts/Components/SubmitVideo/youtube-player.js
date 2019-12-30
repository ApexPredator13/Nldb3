import { modal, Div, h2, t, hr, p } from "../../Framework/renderer";
import { dismissModalSection } from "../General/modal-contents";

let youtubeScriptCreated = false;
let createPlayerInterval = null;

/**
 * Creates a new youtube player and wraps its basic behavior
 * 
 * @constructor
 * @param {string} videoId - the youtube video ID that should be displayed
 */
function YoutubePlayer(videoId) {
    
    /** @type {string} */
    this.videoId = videoId;

    /** @type {boolean} */
    this.playerReady = false;

    /** @type {*} */
    this.player = undefined;

    // window.onYouTubeIframeAPIReady will be called by automatically after the youtube iframe script has been loaded.
    window.onYouTubeIframeAPIReady = () => this.createPlayer();

    // load iframe script if necessary
    if (!youtubeScriptCreated) {
        const youtubeScriptTag = document.createElement('script');
        youtubeScriptTag.src = 'https://www.youtube.com/iframe_api';
        const scriptTags = document.getElementsByTagName('script');
        if (scriptTags && scriptTags.length > 0 && scriptTags[0].parentNode) {
            scriptTags[0].parentNode.insertBefore(youtubeScriptTag, scriptTags[0]);
        }
        youtubeScriptCreated = true;
    } else {
        // if script already exists, just create the player
        setTimeout(() => this.createPlayer(), 2000);
    }
}

YoutubePlayer.prototype = {

    /** creates a new youtube player */
    createPlayer: function () {

        let tries = 0;

        createPlayerInterval = window.setInterval(() => {
            // youtube player creation fails at page load. gotta retry a couple times.
            if (!this.player || this.player.b === null) {
                this.player = new YT.Player('ytplayer', { videoId: this.videoId });
            } else {
                this.playerReady = true;
                console.log('clearing interval', createPlayerInterval);
                clearInterval(createPlayerInterval);
                return;
            }

            if (tries++ >= 20) {
                modal(false,
                    Div(
                        h2(
                            t('An error occurred')
                        ),
                        hr(),
                        p(
                            t('The youtube player could not be initialized.')
                        ),
                        dismissModalSection()
                    )
                )
                console.log('clearing interval', createPlayerInterval);
                clearInterval(createPlayerInterval);
            }
        }, 1000);
        console.log('interval set', createPlayerInterval);
    },


    /** returns the youtube player instance */
    getYoutubePlayer: function () {
        return this.playerReady ? this.player : undefined;
    },


    /** returns the current youtube player time in seconds */
    getCurrentTime: function () {
        const player = this.getYoutubePlayer();
        if (player) {
            return Math.floor(player.getCurrentTime());
        }
        return 0;
    },


    /** pauses the video playback */
    pauseVideo: function () {
        const player = this.getYoutubePlayer();
        if (player) {
            player.pauseVideo();
        }
    },


    /** starts video playback */
    playVideo: function () {
        const player = this.getYoutubePlayer();
        if (player) {
            player.playVideo();
        }
    },


    /** 
     * gets the current state of the player 
     * @returns {number}
     */
    getPlayerState: function() {
        const player = this.getYoutubePlayer();
        if (player) {
            return player.getPlayerState();
        }
        return -1;
    },


    /**
     * goes forward or backwards
     * @param {number} to - number of seconds to go forward or backwards
     */
    seek: function (to) {
        const player = this.getYoutubePlayer();
        if (player) {
            const currentTime = this.getCurrentTime();
            let newTime = currentTime + (to);
            if (newTime < 0) {
                newTime = 0;
            }
            player.seekTo(newTime, true);
        }
    }
}


export {
    YoutubePlayer
}