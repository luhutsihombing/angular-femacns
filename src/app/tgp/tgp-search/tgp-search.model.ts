import {DefaultResponse} from '../../_model/app.model';

export interface TgpSearchTerm {
    endDate: string;
    startDate: string;
}

export interface TgpSearchItem {
    id: string;
    processDate: string;
    modifiedBy: string;
    status: string;
    totalFailedRecord: number;
    totalRecord: number;
    totalSuccessRecord: number;
}

export interface Tgp extends DefaultResponse {
    data: any;
    dataList: Array<any>;
}
