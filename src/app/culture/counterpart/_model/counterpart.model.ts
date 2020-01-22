import {Counterpart} from './counterpart.model';

export interface CounterpartSearchTerm {
    areaName: string;
    cellName: string;
    counterpartName: string;
    counterpartNumber: string;
}

export interface CounterpartSearchItem {
    id: string;
    counterpartNumber: string;
    counterpartName: string;
    lastUpdatedDate: string;
    lastUpdatedBy: string;
}

export interface CounterpartSave {
    id: string;
    counterpartNumber: string;
    counterpartName: string;
    branchCode: string[];
}

export interface CellArea {
    code: string;
    name: string;
    enabled: boolean;
    checked: boolean;
}

export interface CellAreaCounterpart {
    code: string;
    name: string;
    enabled: boolean;
    checked: boolean;
    cell: CellArea[];
}

export interface Counterpart {
    id: string;
    counterpartNumber: string;
    counterpartName: string;
    areaCell: CellAreaCounterpart[];
}

export interface Employee {
    active: boolean;
    birthDate: Date;
    createdBy: string;
    createdDate: Date;
    email: string;
    firstName: string;
    fullName: string;
    idBranch: string;
    idCompany: string;
    idJob: string;
    idJobGroup: string;
    idOrganization: string;
    institution: string;
    lastName: string;
    manager: boolean;
    modifiedBy: string;
    modifiedDate: Date;
    nomorPokok: string;
    peopleType: string;
    phoneNumber: string;
    type: string;
    username: string;
}
