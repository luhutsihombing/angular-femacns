export interface Responsibility {
    accessType: string;
    accessTypeDescription: string;
    active: boolean;
    createdBy: string;
    createdDate: string;
    defaultResp: boolean;
    description: string;
    functions: ResponsibilityFunctions;
    manager: boolean;
    modifiedBy: string;
    modifiedDate: string;
    name: string;
    peopleTypes: Array<{
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
    }>;
}

export interface ResponsibilitySearchItem {
    accessType: string;
    accessTypeDescription: string;
    active: boolean;
    createdBy: string;
    createdDate: string;
    description: string;
    editable: boolean;
    id: string;
    manager: boolean;
    modifiedBy: string;
    modifiedDate: string;
    name: string;
    note: string;
}

export interface ResponsibilitySearchTerm {
    name: string;
    peopleType: string;
}

export interface ResponsibilitySave {
    accessType: string;
    defaultResp: boolean;
    description: string;
    functionIds: string[];
    id: string;
    manager: boolean;
    name: string;
    peopleTypeLookupIds: string[];
}

export interface SingleFunction {
    accessType: string;
    functionEnabled: boolean;
    functionId: string;
    functionName: string;
    icon: string;
    id: string;
    name: string;
    order: number;
    path: string;
    type: 'SingleFunction';
}

export interface ParentFunction {
    accessType: string;
    children: SingleFunction[];
    functionEnabled: boolean;
    functionId: string;
    functionName: string;
    icon: string;
    id: string;
    name: string;
    order: number;
    path: string;
    type: 'ParentFunction';
}

export interface ResponsibilityFunctions {
    WEB: Array<SingleFunction | ParentFunction>;
    MOBILE: Array<SingleFunction | ParentFunction>;
}
