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
        cellCreator: (video: Video) => td(video.duration.toString(10)),
        sortByOnClick: VideoOrderBy.Duration
    }

    const createPublishedCell: VideosComponentCellCreator = {
        cellHeader: 'Releasedate (m/d/y) ⇓',
        cellCreator: (video: Video) => td(video.published),
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
            return cell;
        }
    }

    const createLikesCell: VideosComponentCellCreator = {
        cellHeader: 'Likes',
        cellCreator: (video: Video) => td(video.likes ? video.likes.toString(10) : undefined),
        sortByOnClick: VideoOrderBy.Likes
    }

    const createDislikesCell: VideosComponentCellCreator = {
        cellHeader: 'Dislikes',
        cellCreator: (video: Video) => td(video.dislikes ? video.dislikes.toString(10) : undefined),
        sortByOnClick: VideoOrderBy.Dislikes
    };

    const createLikeDislikeRatioCell: VideosComponentCellCreator = {
        cellHeader: 'Ratio',
        cellCreator: (video: Video) => td(video.ratio ? video.ratio.toFixed(2) : undefined),
        sortByOnClick: VideoOrderBy.LikeDislikeRatio
    };

    const createViewcountCell: VideosComponentCellCreator = {
        cellHeader: 'Views',
        cellCreator: (video: Video) => td(video.view_count ? video.view_count.toString(10) : undefined),
        sortByOnClick: VideoOrderBy.ViewCount
    };

    const createFavoriteCountCell: VideosComponentCellCreator = {
        cellHeader: 'Favorites',
        cellCreator: (video: Video) => td(video.favorite_count ? video.favorite_count.toString(10) : undefined),
        sortByOnClick: VideoOrderBy.FavoriteCount
    };

    const createCommentCountCell: VideosComponentCellCreator = {
        cellHeader: 'Comments',
        cellCreator: (video: Video) => td(video.comment_count ? video.comment_count.toString(10) : undefined),
        sortByOnClick: VideoOrderBy.CommentCount
    };

    const createIsHdCell: VideosComponentCellCreator = {
        cellHeader: 'Comments',
        cellCreator: (video: Video) => td(video.is_hd ? 'Yes' : 'No')
    };

    new VideosComponent(
        'video-table',
        createTitleCell,
        createVideoDurationCell,
        createPublishedCell,
        createSubmitLink,
        createLikesCell,
        createDislikesCell,
        createLikeDislikeRatioCell,
        createViewcountCell,
        createFavoriteCountCell,
        createCommentCountCell,
        createIsHdCell
    );
})();

