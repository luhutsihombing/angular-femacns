export interface Error {
    header: string;
    message: string;
}

export interface DefaultResponse {
    agentId?: string;
    currentPage?: number;
    dataList?: Array<any>;
    lastPage?: number;
    localOnly?: boolean;
    localeCode?: string;
    message?: string;
    messageArgs?: string[];
    module?: string;
    pageSize?: number;
    sessionId?: string;
    sourceId?: string;
    statusCode?: number;
    timestamp?: string;
    trxType?: string;
    username?: string;
    totalCount?: number;
}

export interface SearchPagination<T> {
    data: T;
    currentPage: number;
    descending: boolean;
    orderBy: string[];
}

export interface PaginatedResponse<T> {
    agentId: string;
    currentPage: number;
    data: T;
    dataList: Array<T>;
    module: string;
    pageSize: number;
    sessionId: string;
    sourceId: string;
    statusCode: number;
    timestamp: string;
    totalCount: number;
    trxType: string;
    username: string;
}

export interface GenericResponse {
    type: 'GenericResponse';
    timestamp: number;
    localOnly: boolean;
    statusCode: number;
    message: string;
    currentPage: number;
    pageSize: number;
    lastPage: number;
    totalCount: number;
}

export interface ErrorResponse {
    type: 'ErrorResponse';
    timestamp: number;
    message: string;
    exception: string;
    status: number;
    error: string;
    path: string;
}

export type ActionResponse = GenericResponse | ErrorResponse;

export interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}

export interface FemaOption {
    detailCode: string;
    meaning: string;
}
