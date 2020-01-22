import {DefaultResponse, PaginatedResponse} from '../../_model/app.model';

export interface Event {
    category: string;
    email: boolean;
    endDate: string;
    endTime: string;
    eventName: string;
    id: string;
    listMember: Array<{
        peopleType?: string;
        company?: string;
        branch?: string;
        organization?: string;
        jobGroup?: string;
        job?: string;
        username?: number;
    }>;
    listReminder: Array<{
        reminder: string;
    }>;
    listSpeaker: Array<{
        material: string;
        speakerId: string;
        speakerName: string;
        speakerType: string;
    }>;
    mandatory: boolean;
    needFeedback: boolean;
    place: string;
    pushNotification: boolean;
    reminder: boolean;
    startDate: string;
    startTime: string;
    targetParticipant: string;
    type: string;
    uploadId: string;
}

export interface EventSave extends DefaultResponse {
    category: string;
    email: boolean;
    endDate: string;
    eventName: string;
    id?: string;
    listReminder: Array<{
        reminder: string;
    }>;
    listSpeaker: Array<{
        material: string;
        speakerId: string;
        speakerName: string;
        speakerType: string;
    }>;
    mandatory: boolean;
    needFeedback: boolean;
    place: string;
    pushNotification: boolean;
    reminder: boolean;
    startDate: string;
    targetParticipant: string;
    template: void;
    type: string;
    uploadId: string;
}

export interface EventSearchTerm {
    category: string;
    endDate: string;
    eventName: string;
    startDate: string;
    type: string;
}

export interface EventSearchItem {
    category: string;
    endDate: string;
    eventName: string;
    id: string;
    lastUpdateBy: string;
    lastUpdateDate: string;
    startDate: string;
    targetedParticipant: number;
    totalAttend: number;
    totalJoin: number;
    type: string;
}

export class EventParticipantItem {
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

export class EventParticipant {
    countError: number;
    countSuccess: number;
    errorItems: Array<EventParticipantItem>;
    errors: string[];
    successItems: Array<EventParticipantItem>;
    uploadId: string;
}

export interface EventSuggestion {
    id: string;
    thumbPath: string;
    title: string;
}

export interface EventDetailItem {
    endDate: string;
    materialAndSpeakers: Array<{}>;
    startDate: string;
    title: string;
    totalParticipant: number;
    lastPage: number;
    localOnly: boolean;
    message: string;
    pageSize: number;
    statusCode: number;
    timestamp: number;
}

export interface Employee {
    active: boolean;
    createdDate: number;
    modifiedDate: number;
    createdBy: string;
    modifiedBy: string;
    nomorPokok: string;
    firstName: string;
    lastName: string;
    fullName: string;
    type: string;
    peopleType: string;
    idCompany: string;
    idBranch: string;
    idOrganization: string;
    idJobGroup: string;
    idJob: string;
    username: string;
    email: string;
    phoneNumber: string;
    manager: boolean;
    birthDate: number;
}
