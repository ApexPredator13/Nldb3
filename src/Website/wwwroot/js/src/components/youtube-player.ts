export class YoutubePlayer {
    constructor() {
        // create youtube player callback function
        (window as any).onYouTubeIframeAPIReady = () => {
            console.log('onYouTubeIframeAPIReady called');
            (window as any).youtubePlayer = new (window as any).YT.Player('ytplayer', {});

            console.log('player created', (window as any).youtubePlayer);

            // stretch the iframe
            const iframe = document.getElementById('ytplayer') as HTMLIFrameElement;
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.width = '100%';
            iframe.height = '100%';
        }

        // create youtube player
        const youtubeScriptTag = document.createElement('script');
        youtubeScriptTag.src = 'https://www.youtube.com/iframe_api';
        const scriptTags = document.getElementsByTagName('script');
        if (scriptTags && scriptTags.length > 0 && scriptTags[0].parentNode) {
            scriptTags[0].parentNode.insertBefore(youtubeScriptTag, scriptTags[0]);
        }
    }

    public getYoutubePlayer(): any {
        return (window as any).youtubePlayer;
    }

    public getCurrentTime(): number {
        return Math.floor(this.getYoutubePlayer().getCurrentTime());
    }
}