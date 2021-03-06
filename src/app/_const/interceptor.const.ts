import {
    API_CONTENT_POST_UPLOAD,
    API_CONTENT_POST_RECEIVER,
    API_EVENT_POST_RECEIVER,
    API_TGP_POST_FILE,
    API_CHANNEL_POST_VIEWER
} from './api.const';

export const JSON_HEADERS_ENDPOINT_EXCEPTIONS = [
    API_CHANNEL_POST_VIEWER,
    API_CONTENT_POST_UPLOAD,
    API_CONTENT_POST_RECEIVER,
    API_EVENT_POST_RECEIVER,
    API_TGP_POST_FILE,
    'http://localhost:5000/news-4c04fb88ed73a5a5bcde3a32f0402a82193a04d0554919b964116d226cbe6612.html'
];
