import { VideoRequest } from '../interfaces/video-request';

const CreateGetVideosUri = (request: VideoRequest) => {
    console.log(request);
    const base = '/api/videos/';
    const asc = `?Asc=${request.Asc ? 'true' : 'false'}`;
    const orderBy = `&OrderBy=${request.OrderBy}`;
    const search = request.Search ? `&Search=${request.Search}` : '';
    const page = `&Page=${request.Page.toString(10)}`;
    const amount = `&Amount=${request.Amount.toString(10)}`;
    const from = request.From ? `&From=${request.From}` : '';
    const until = request.Until ? `&From=${request.Until}` : '';
    const completeUri = `${base}${asc}${orderBy}${search}${page}${amount}${from}${until}`;
    console.log(completeUri);
    return completeUri;
};

export {
    CreateGetVideosUri
}


