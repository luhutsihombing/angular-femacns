export interface User {
    active: boolean;
    username: string;
    fullName: string;
    peopleTypeLookupId: string;
    peopleTypeDescription: string;
    birthDate: any;
    email: string;
    modifiedBy: string;
    modifiedDate: string;
    editable: boolean;
    createdBy: string;
    createdDate: string;
    phoneNumber: string;
    institution: string;
    branchCode: string;
    branchDescription: string;
    orgCode: string;
    orgDescription: string;
    jobCode: string;
    generatedUsername: boolean;
    responsibilitiesWeb: Array<{
        id: string;
        active: boolean;
        modifiedDate: number;
        modifiedBy: string;
        createdBy: string;
        createdDate: string;
        name: string;
        description: string;
        manager: boolean;
        accessType: string;
        accessTypeDescription: string;
        editable: boolean;
        note: string;
    }>;
    userResponsibilitiesWeb: Array<{
        id: string;
        active: boolean;
        modifiedDate: number;
        modifiedBy: string;
        createdBy: string;
        createdDate: string;
        name: string;
        description: string;
        manager: boolean;
        accessType: string;
        accessTypeDescription: string;
        editable: boolean;
        note: string;
    }>;
    responsibilitiesMobile: Array<{
        active: boolean;
        accessType: string;
        accessTypeDescription: string;
        description: string;
        id: string;
        modifiedDate: number;
        modifiedBy: string;
        name: string;
        manager: boolean;
        editable: boolean;
        note: string;
        createdBy: string;
        createdDate: string;
    }>;
    userResponsibilitiesMobile: Array<{
        active: boolean;
        accessType: string;
        accessTypeDescription: string;
        description: string;
        id: string;
        modifiedDate: number;
        modifiedBy: string;
        name: string;
        manager: boolean;
        editable: boolean;
        note: string;
        createdBy: string;
        createdDate: string;
    }>;
}

// API_USER_POST_SEARCH

export interface UserSearchTerm {
    fullName: string;
    responsibility: string;
    username: string;
}

export interface UserSearchItem {
    active: true;
    createdBy: string;
    createdDate: string;
    fullName: string;
    modifiedBy: string;
    modifiedDate: string;
    peopleType: string;
    peopleTypeName: string;
    username: string;
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

export interface Organization {
    active: boolean;
    branchCode: string;
    companyCode: string;
    createdBy: string;
    createdDate: string;
    kode: string;
    modifiedBy: string;
    modifiedDate: string;
    nama: string;
    shortCode: string;
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
