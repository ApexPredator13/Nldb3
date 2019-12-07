enum YoutubePlayerState {
    NotStartet = -1,
    Ended,
    CurrentlyPlaying,
    Paused,
    Buffering,
    VideoPositioned
}

class YoutubePlayer {

    static youtubeScriptCreated = false;

    constructor() {
        // create youtube player callback function
        (window as any).onYouTubeIframeAPIReady = () => {
            (window as any).youtubePlayer = new (window as any).YT.Player('ytplayer', {});
        }

        // load iframe script if necessary
        if (!YoutubePlayer.youtubeScriptCreated) {
            const youtubeScriptTag = document.createElement('script');
            youtubeScriptTag.src = 'https://www.youtube.com/iframe_api';
            const scriptTags = document.getElementsByTagName('script');
            if (scriptTags && scriptTags.length > 0 && scriptTags[0].parentNode) {
                scriptTags[0].parentNode.insertBefore(youtubeScriptTag, scriptTags[0]);
            }
            YoutubePlayer.youtubeScriptCreated = true;
        }
    }

    GetYoutubePlayer(): any {
        return (window as any).youtubePlayer;
    }

    GetCurrentTime(): number {
        return Math.floor(this.GetYoutubePlayer().getCurrentTime());
    }

    PauseVideo(): void {
        this.GetYoutubePlayer().pauseVideo();
    }

    PlayVideo(): void {
        this.GetYoutubePlayer().playVideo();
    }

    Seek(amount: number): void {
        const currentTime = this.GetCurrentTime();

        let newTime = currentTime + (amount);
        if (newTime < 0) {
            newTime = 0;
        }

        this.GetYoutubePlayer().seekTo(newTime, true);
    }

    GetPlayerState(): YoutubePlayerState {
        return this.GetYoutubePlayer().getPlayerState();
    }
}

export {
    YoutubePlayer,
    YoutubePlayerState
}

