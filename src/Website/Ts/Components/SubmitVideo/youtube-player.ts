export class YoutubePlayer {

    static youtubeScriptCreated = false;

    private playerReady = false;
    private createPlayerInterval: number | undefined;
    private player: YT.Player | undefined;

    constructor(private videoId: string) {
        // create youtube player callback function
        (window as any).onYouTubeIframeAPIReady = () => this.CreatePlayer();

        // load iframe script if necessary
        if (!YoutubePlayer.youtubeScriptCreated) {
            const youtubeScriptTag = document.createElement('script');
            youtubeScriptTag.src = 'https://www.youtube.com/iframe_api';
            const scriptTags = document.getElementsByTagName('script');
            if (scriptTags && scriptTags.length > 0 && scriptTags[0].parentNode) {
                scriptTags[0].parentNode.insertBefore(youtubeScriptTag, scriptTags[0]);
            }
            YoutubePlayer.youtubeScriptCreated = true;
        } else {
            // if script already exists, just create the player
            setTimeout(() => this.CreatePlayer(), 2000);
        }
    }

    private CreatePlayer() {
        this.createPlayerInterval = setInterval(() => {
            // youtube player creation fails at page load. gotta retry a couple times.
            if (!this.player || (this.player as any).b === null) {
                this.player = new YT.Player('ytplayer', { videoId: this.videoId });
            } else {
                this.playerReady = true;
                clearInterval(this.createPlayerInterval);
                this.createPlayerInterval = undefined;
            }
        }, 200);
    }

    private GetYoutubePlayer(): YT.Player | undefined {
        return this.playerReady ? this.player : undefined;
    }

    GetCurrentTime(): number {
        const player = this.GetYoutubePlayer();
        if (player) {
            return Math.floor(player.getCurrentTime());
        }
        return 0;
    }

    PauseVideo(): void {
        const player = this.GetYoutubePlayer();
        if (player) {
            player.pauseVideo();
        }
    }

    PlayVideo(): void {
        const player = this.GetYoutubePlayer();
        if (player) {
            player.playVideo();
        }
    }

    Seek(to: number): void {
        const player = this.GetYoutubePlayer();
        if (player) {
            const currentTime = this.GetCurrentTime();
            let newTime = currentTime + (to);
            if (newTime < 0) {
                newTime = 0;
            }
            player.seekTo(newTime, true);
        }
    }

    GetPlayerState(): YT.PlayerState {
        const player = this.GetYoutubePlayer();
        if (player) {
            return player.getPlayerState();
        }
        return YT.PlayerState.UNSTARTED;
    }

    DestroyIframe(): void {
        const player = this.GetYoutubePlayer();
        if (player) {
            player.destroy();
        }
    }
}

