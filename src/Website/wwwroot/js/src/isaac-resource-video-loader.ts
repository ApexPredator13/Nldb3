import { VideosComponent, VideosComponentCellCreator } from './components/videos';
import { Video } from './interfaces/video';
import { VideoOrderBy } from './enums/video-order-by';

let td = (innerHtml?: string) => {
    const cell = document.createElement('td');
    if (innerHtml) {
        cell.innerHTML = innerHtml;
    }
    return cell;
}

// returns number as string, with thousands seperator
let printNumber = (num: number | undefined | null, decimals: null | 1 | 2 = null): string | undefined => {
    if (num) {
        if (decimals) {
            return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return num.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    } else {
        return undefined;
    }
}

(() => {
    const createTitleCell: VideosComponentCellCreator = {
        cellHeader: 'Title',
        cellCreator: (video: Video) => {
            const cell = td();
            if (video.submission_count > 0) {
                const a = document.createElement('a');
                a.innerText = video.title;
                a.href = `/Video/${video.id}`;
                cell.appendChild(a);
            } else {
                const span = document.createElement('span');
                span.innerText = video.title;
                span.classList.add('gray');
                cell.appendChild(span);
            }

            return cell;
        },
        sortByOnClick: VideoOrderBy.Title
    };

    const createVideoDurationCell: VideosComponentCellCreator = {
        cellHeader: 'Duration',
        cellCreator: (video: Video) => {
            const cell = td(video.duration.toString(10));
            cell.classList.add('r', 'mono');
            return cell;
        },
        sortByOnClick: VideoOrderBy.Duration
    }

    const createPublishedCell: VideosComponentCellCreator = {
        cellHeader: 'Releasedate (m/d/y) ⇓',
        cellCreator: (video: Video) => {
            const cell = td(video.published);
            cell.classList.add('r', 'mono');
            return cell;
        },
        sortByOnClick: VideoOrderBy.Published
    }

    const createSubmitLink: VideosComponentCellCreator = {
        cellHeader: 'Submit',
        cellCreator: (video: Video) => {
            const cell = td();
            const link = document.createElement('a');
            link.innerText = 'Submit';
            link.href = `/SubmitEpisode/${video.id}`;
            cell.appendChild(link);
            cell.classList.add('r');
            return cell;
        }
    }

    const createLikesCell: VideosComponentCellCreator = {
        cellHeader: '👍',
        cellHeaderTitle: 'Number of Likes',
        cellCreator: (video: Video) => {
            const cell = td(printNumber(video.likes));
            cell.classList.add('r', 'mono');
            return cell;
        },
        sortByOnClick: VideoOrderBy.Likes
    }

    const createDislikesCell: VideosComponentCellCreator = {
        cellHeader: '👎',
        cellHeaderTitle: 'Number of Dislikes',
        cellCreator: (video: Video) => {
            const cell = td(printNumber(video.dislikes));
            cell.classList.add('r', 'mono');
            return cell;
        },
        sortByOnClick: VideoOrderBy.Dislikes
    };

    const createLikeDislikeRatioCell: VideosComponentCellCreator = {
        cellHeader: '👎%',
        cellHeaderTitle: 'Dislikes in %',
        cellCreator: (video: Video) => {
            const cell = td(printNumber(video.ratio, 2));
            cell.classList.add('r', 'mono');
            return cell;
        },
        sortByOnClick: VideoOrderBy.LikeDislikeRatio
    };

    const createViewcountCell: VideosComponentCellCreator = {
        cellHeader: 'Views',
        cellCreator: (video: Video) => {
            const cell = td(printNumber(video.view_count));
            cell.classList.add('r', 'mono');
            return cell;
        },
        sortByOnClick: VideoOrderBy.ViewCount
    };

    const createCommentCountCell: VideosComponentCellCreator = {
        cellHeader: 'Comm',
        cellCreator: (video: Video) => {
            const cell = td(printNumber(video.comment_count));
            cell.classList.add('r', 'mono');
            return cell;
        },
        sortByOnClick: VideoOrderBy.CommentCount,
        cellHeaderTitle: 'Number of Comments'
    };

    const createIsHdCell: VideosComponentCellCreator = {
        cellHeader: 'HD',
        cellCreator: (video: Video) => {
            const cell = td(video.is_hd ? '✔' : '✘');
            cell.classList.add(video.is_hd ? 'green' : 'orange', 'r');
            return cell;
        }
    };

    new VideosComponent(
        'video-table',
        createTitleCell,
        createVideoDurationCell,
        createPublishedCell,
        createLikesCell,
        createDislikesCell,
        createLikeDislikeRatioCell,
        createViewcountCell,
        createCommentCountCell,
        createIsHdCell,
        createSubmitLink
    );
})();

