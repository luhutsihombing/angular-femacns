export class ReportData {
    header: string[];
    entries: Array<Number | String>[];
}

export interface ReportNewsDetailSearchTerm {
    endDate?: string;
    startDate?: string;
    title?: string;
    viewer?: string;
}

export interface ReportNewsSummarySearchTerm {
    startDate?: string;
    endDate?: string;
    title?: string;
}

export interface ReportVideoDetailSearchTerm {
    empName?: string;
    endDate?: string;
    startDate?: string;
    title?: string;
}

export interface ReportVideoSummarySearchTerm {
    category: string;
    title?: string;
}

export interface ReportFeedbackSearchTerm {
    eventName: string;
    responden: string;
    startDate: string;
    endDate: string;
}

export interface ReportFeedbackQuestion {
    id: string;
    question: string;
}

export interface Branch {
    active: boolean;
    companyCode: string;
    createdBy: string;
    createdDate: string;
    kode: string;
    modifiedBy: string;
    modifiedDate: string;
    nama: string;
}

export interface Job {
    active: boolean;
    createdBy: string;
    createdDate: string;
    groupCode: string;
    kode: string;
    manager: boolean;
    modifiedBy: string;
    modifiedDate: string;
    nama: string;
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

export interface ReportTgpTerm {
    branchName: string;
    currentPage: number;
    employeeName: string;
    jobName: string;
    monthFrom: number;
    monthTo: number;
    orders: Array<{
        columnName: string;
        descending: boolean;
    }>;
    pageSize: number;
    year: number;
}

export interface ReportTgpDownloadTerm {
    branch: string;
    employee: string;
    endMonth: number;
    job: string;
    startMonth: number;
    year: number;
}

export interface ReportTgpItem {
    branchCode: string;
    branchName: string;
    bp: number;
    couponNumber: string;
    employeeName: string;
    employeeNo: string;
    jobCode: string;
    jobName: string;
    month: number;
    year: number;
}

export interface ReportActivity {
    id: string;
    eventType: string;
    eventOrganizer: string;
    cell: string;
    counterPartName: string;
    mainCoordinatorEmployeeNumber: string;
    mainCoordinatorName: string;
    npkNotulen: string;
    notulenName: string;
    intervalTypeEvent: string;
    eventDate: number;
    eventVenue: string;
    participantNumberGroup: string;
    eventNotes: string;
    target: string;
    timelineStart: number;
    timelineEnd: number;
    attachments: Array<{
        id: string;
        imageLocation: string;
    }>;
    keyPeople: Array<{
        id: string;
        keyPeople: string;
        isAttending: string;
    }>;
}
