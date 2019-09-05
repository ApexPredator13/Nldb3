import { VideosComponent, VideosComponentCellCreator } from './components/videos';
import { VideoOrderBy } from './enums/video-order-by';
import { Video } from './interfaces/video';

let td = (innerHtml?: string) => {
    const cell = document.createElement('td');
    if (innerHtml) {
        cell.innerHTML = innerHtml;
    }
    return cell;
}

(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const title: VideosComponentCellCreator = {
            cellHeader: 'Title',
            sortByOnClick: VideoOrderBy.Title,
            cellCreator: (video: Video) => td(video.title)
        };

        const submissions: VideosComponentCellCreator = {
            cellHeader: 'Submissions',
            cellCreator: (video: Video) => {
                const cell = td();
                if (video.submission_count > 0) {
                    const a = document.createElement('a');
                    a.href = `/Admin/Submissions/ViewSubmissions/${video.id}`;
                    a.innerText = `Edit ${video.submission_count} submission${video.submission_count === 1 ? '' : 's'}`;
                    cell.appendChild(a);
                }
                return cell;
            }
        }

        new VideosComponent('video-table', title, submissions)
    });
})();