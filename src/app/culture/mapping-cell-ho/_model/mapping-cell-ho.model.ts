import {DefaultResponse} from '../../../_model/app.model';

export interface MappingHOTerm {
    cellName?: string;
    organization?: string;
}

export interface MappingHoSearchItem {
    id: string;
    cellName: string;
    pembinaUtama: string;
    lastUpdatedBy: string;
    lastUpdatedDate: string;
    modifiedBy: string;
    modifiedDate: string;
}

export interface Organization {
    shortCode: string;
    orgCode: string;
    orgName: string;
}

export interface OrgDataList {
    shortCode: string;
    orgCode: string;
    orgName: string;
}

export interface MappingHO {
    cellId: string;
    cellName: string;
    organizations: Array<{
        orgCode: string;
        orgName: string;
        shortCode: string;
    }>;
    pembinaUtama: string;
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
