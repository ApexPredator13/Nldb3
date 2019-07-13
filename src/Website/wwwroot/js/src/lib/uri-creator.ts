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
    const resourceId = request.ResourceId ? `&ResourceId=${request.ResourceId}` : '';
    const resourceType = request.ResourceType ? `&ResourceType=${request.ResourceType.toString(10)}` : '';
    const completeUri = `${base}${asc}${orderBy}${search}${page}${amount}${from}${until}${resourceType}${resourceId}`;
    console.log('requesting videos: ', completeUri);
    return completeUri;
};

export {
    CreateGetVideosUri
}


