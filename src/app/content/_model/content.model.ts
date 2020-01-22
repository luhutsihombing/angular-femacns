import {ResourcePath} from './api-resource.model';
import {LookupDetail} from '../../lookup/_model/lookup.model';

export class ContentResources {
    news: ResourcePath;
    banner: ResourcePath;
    popup: ResourcePath;
}

export class ContentLookups {
    minPeriodStart: number;
    minChar: number;
    maxBannerSize: number;
    maxBannerDesc: number;
    maxPopupSize: number;
    maxPopupDesc: number;
    minPublishDate: string;
}

export class ContentBanner {
    active: boolean;
    defaultBanner: boolean;
    description: string;
    eventName: string;
    id: string;
    idLinkedMenu: string;
    imgLocation: string;
    periodEnd: any;
    periodStart: any;
    refId: string;
    title: string;
}

export interface ContentNews {
    contentPath: string;
    id: string;
    idNewsCategory: string;
    thumbPath: string;
}

export interface ContentPopup {
    active: boolean;
    description: string;
    eventName: string;
    id: string;
    idLinkedMenu: string;
    imgLocation: string;
    periodEnd: any;
    periodStart: any;
    refId: string;
    title: string;
}

export interface Content {
    bannerDto: ContentBanner;
    contentReceiverType: string;
    id: string;
    newsDto: ContentNews;
    popupDto: ContentPopup;
    publishDate: any;
    title: string;
    uploadId: string;
    viaEmail: boolean;
    viaPushNotification: boolean;
}

export class ContentReceiverSummaryItem {
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

export class ContentReceiverSummary {
    countError: number;
    countSuccess: number;
    errorItems: Array<ContentReceiverSummaryItem>;
    errors: string[];
    successItems: Array<ContentReceiverSummaryItem>;
    uploadId: string;
}

export interface ContentSearchTerm {
    contentReceiver: string;
    contentReceiverType: string;
    contentSetupType: string;
    title: string;
    startActivePeriod: any;
    endActivePeriod: any;
}

export class ContentSearchItem {
    contentReceiver: string;
    id: string;
    lastUpdateBy: string;
    lastUpdateDate: string;
    title: string;
}

export class ContentSuggestion {
    type: 'contentSuggestion';
    id: string;
    thumbPath: string;
    title: string;
}

export class ContentFormOptions {
    newsCategories: LookupDetail[];
    linkMenu: LookupDetail[];
    contentReceivers: Array<{ value: string; label: string }>;
}
