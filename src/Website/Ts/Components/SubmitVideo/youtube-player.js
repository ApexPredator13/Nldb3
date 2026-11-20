import { modal, Div, h2, t, hr, p } from "../../Framework/renderer";
import { dismissModalSection } from "../General/modal-contents";

let youtubeScriptCreated = false;
let initTimeout = null;

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

    if (initTimeout) {
        clearTimeout(initTimeout);
        initTimeout = null;
    }

    if (window.YT && typeof window.YT.ready === 'function') {
        window.YT.ready(() => this.createPlayer());
    } else {
        // window.onYouTubeIframeAPIReady will be called automatically after the youtube iframe script has been loaded.
        window.onYouTubeIframeAPIReady = () => this.createPlayer();

        // load iframe script if necessary
        if (!youtubeScriptCreated) {
            const youtubeScriptTag = document.createElement('script');
            youtubeScriptTag.src = 'https://www.youtube.com/iframe_api';
            const scriptTags = document.getElementsByTagName('script');
            if (scriptTags && scriptTags.length > 0 && scriptTags[0].parentNode) {
                scriptTags[0].parentNode.insertBefore(youtubeScriptTag, scriptTags[0]);
            } else if (document.head) {
                document.head.appendChild(youtubeScriptTag);
            }
            youtubeScriptCreated = true;
        }
    }
}

YoutubePlayer.prototype = {

    /** creates a new youtube player */
    createPlayer: function () {
        if (this.player || !document.getElementById('ytplayer')) {
            return;
        }

        if (initTimeout) {
            clearTimeout(initTimeout);
            initTimeout = null;
        }

        this.player = new YT.Player('ytplayer', {
            videoId: this.videoId,
            playerVars: {
                origin: window.location.origin,
                rel: 0,
                autoplay: 0
            },
            events: {
                onReady: () => {
                    this.playerReady = true;
                    if (initTimeout) {
                        clearTimeout(initTimeout);
                        initTimeout = null;
                    }
                }
            }
        });

        initTimeout = window.setTimeout(() => {
            initTimeout = null;
            if (!this.playerReady && document.getElementById('ytplayer')) {
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
                );
            }
        }, 20000);
    },


    /** returns the youtube player instance */
    getYoutubePlayer: function () {
        return this.playerReady ? this.player : undefined;
    },


    /** returns the current youtube player time in seconds */
    getCurrentTime: function () {
        const player = this.getYoutubePlayer();
        if (player && typeof player.getCurrentTime === 'function') {
            return Math.floor(player.getCurrentTime());
        }
        return 0;
    },


    /** pauses the video playback */
    pauseVideo: function () {
        const player = this.getYoutubePlayer();
        if (player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
        }
    },


    /** starts video playback */
    playVideo: function () {
        const player = this.getYoutubePlayer();
        if (player && typeof player.playVideo === 'function') {
            player.playVideo();
        }
    },


    /** 
     * gets the current state of the player 
     * @returns {number}
     */
    getPlayerState: function() {
        const player = this.getYoutubePlayer();
        if (player && typeof player.getPlayerState === 'function') {
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
        if (player && typeof player.seekTo === 'function') {
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