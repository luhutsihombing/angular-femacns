export interface ChannelSearchTerm {
    channel: string;
    createDateFrom: string;
    createDateTo: string;
}

export interface ChannelSearchItem {
    channel: string;
    createdDate: string;
    id: string;
    lastUpdate: string;
    lastUpdateBy: string;
}

export interface Fiftube {
    id: string;
    thumbnailUrl: string;
    title: string;
    url: string;
}

export interface Channel {
    channel: string;
    description: string;
    fiftubes: Fiftube[];
    iconChannelPath: string;
    id: string;
    uploadId: string;
    viewer: string;
}

export interface ChannelSuggestion {
    id: string;
    thumbPath: string;
    title: string;
}

export class ChannelViewerSummaryItem {
    active: boolean;
    company?: string;
    branch?: string;
    createdBy: string;
    createdDate: number;
    id: string;
    job?: string;
    jobGroup?: string;
    modifiedBy: string;
    modifiedDate: number;
    order: number;
    organization?: string;
    peopleType?: string;
    uploadId: string;
    uploadStatus: string;
    username: string;
}

export class ChannelViewerSummary {
    countError: number;
    countSuccess: number;
    errorItems: Array<ChannelViewerSummaryItem>;
    errors: string[];
    successItems: Array<ChannelViewerSummaryItem>;
    uploadId: string;
}

export class ChannelSave {
    channel: string;
    description: string;
    fiftubes: Array<{
        id: string;
        thumbnailUrl: string;
        title: string;
        url: string;
    }>;
    iconChannelPath: string;
    id: string;
    uploadId: string;
    viewer: string;
}
