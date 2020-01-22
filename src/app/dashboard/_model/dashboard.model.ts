export interface DashboardBarChart {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
    }>;
}

export interface DashboardYearlyUserAccess {
    apr: number;
    aug: number;
    dec: number;
    feb: number;
    jan: number;
    jul: number;
    jun: number;
    mar: number;
    may: number;
    nov: number;
    oct: number;
    peopleTypeDesc: string;
    peopleTypeLookupId: string;
    sep: number;
}

export interface DashboardNotification {
    android_click: string;
    apns_click: string;
    body: string;
    category: string;
    createdDate: number;
    id: string;
    refId: string;
    shown_as_body: boolean;
    title: string;
    type: string;
}

export interface NotificationMessage {
    android_click: string;
    apns_click: string;
    body: string;
    category: string;
    createdDate: Date;
    id: string;
    lstNotifDetail: Array<{
        branch: string;
        company: string;
        createdDate: Date;
        job: string;
        jobGroup: string;
        organization: string;
        peopleType: string;
        peopleTypeCode: string;
        username: string;
    }>;
    refId: string;
    shown_as_body: boolean;
    title: string;
    type: string;
    receipientFullname: string;
    receipient: string;
}

export interface DashboardFeedbackEvent {
    category: string;
    email: boolean;
    endDate: number;
    eventName: string;
    id: string;
    listReminder: any[];
    listSpeaker: any[];
    listMember: any[];
    mandatory: boolean;
    needFeedback: boolean;
    place: string;
    pushNotification: boolean;
    reminder: boolean;
    respondentsPercentage: number;
    startDate: number;
    targetParticipant: string;
    totalRespondents: number;
    totalTarget: number;
    type: string;
}
