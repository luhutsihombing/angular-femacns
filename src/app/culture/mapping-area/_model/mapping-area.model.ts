import {DefaultResponse} from '../../../_model/app.model';

export interface Branch {
    active?: boolean;
    createdBy?: string;
    createdDate?: string;
    modifiedBy?: string;
    modifiedDate?: string;
    branchCode: string;
    branchName: string;
}

export interface AreaSearchTerm {
    areaName: string;
    cellName: string;
}

export interface AreaSearchItem {
    id: string;
    areaName: string;
    lastUpdatedBy: string;
    lastUpdatedDate: string;
}

export interface MappingArea extends DefaultResponse {
    data: {
        id: string;
        areaName: string;
        branchCode: Array<{ string }>;
        branches: Array<{
            branchCode: string;
            branchName: string;
            active: boolean;
        }>;
    };
}

export interface BranchSearch {
    branchName: string;
    areaId?: string;
}
