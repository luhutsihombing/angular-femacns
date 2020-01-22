export interface WistiaVideoResponse {
    id: number;
    name: string;
    type: string;
    created: string;
    updated: string;
    duration: number;
    hashed_id: string;
    progress: number;
    thumbnail: {
        url: string;
        width: number;
        height: number;
    };
}

export interface VideoSearchTerm {
    category: string;
    title: string;
    uploadDateFrom: any;
    uploadDateTo: any;
}

export interface VideoSearchItem {
    fiftubeCategory: string;
    id: string;
    lastUpdateBy: string;
    lastUpdateDate: string;
    thumbPath: string;
    title: string;
    uploadedDate: string;
}

export interface Video {
    category: string;
    description: string;
    duration: number;
    feedback: string;
    id: string;
    showOnHome: boolean;
    thumbnailUrl: string;
    title: string;
    uploadDate: string;
    url: string;
    viewable: boolean;
}

export interface VideoSuggestion {
    type: 'videoSuggestion';
    id: string;
    thumbPath: string;
    title: string;
    url: string;
}
