import { DefaultResponse } from '../../_model/app.model';

// API_LOOKUP_GET_DETAIL

export interface LookupDetail {
    active: boolean;
    createdBy: string;
    createdDate: string;
    dataType: string;
    description: string;
    detailCode: string;
    id: string;
    meaning: string;
    modifiedBy: string;
    modifiedDate: string;
    parent: string;
}

// API_LOOKUP_GET_DETAIL_MEANING

export interface LookupMeaning {
    dateValue?: string;
    numericValue?: number;
    textValue?: string;
}

// API_LOOKUP_GET_GLOBAL_SETUP

export interface LookupGlobalSetup {
    dateValue: string;
    numericValue: number;
    textValue: string;
}

// API_LOOKUP_POST_SEARCH

export interface LookupSearchTerm extends DefaultResponse {
    name: string;
    description: string;
    currentPage: number;
    descending: boolean;
    orderBy: string[];
}

// API_LOOKUP_POST_SAVE

export interface LookupSaveTerm {
    active: boolean;
    createdBy: string;
    createdDate: string;
    dataType: string;
    description: string;
    details: Array<{
        active: true;
        createdBy: string;
        createdDate: string;
        dataType: string;
        description: string;
        detailCode: string;
        id: string;
        meaning: string;
        modifiedBy: string;
        modifiedDate: string;
        parent: string;
    }>;
    modifiedBy: string;
    modifiedDate: string;
    name: string;
}

// API_LOOKUP_GET

export interface Lookup {
    active: boolean;
    createdDate: number;
    modifiedDate: number;
    createdBy: string;
    modifiedBy: string;
    name: string;
    description: string;
    dataType: string;
    details: LookupDetail[];
}
