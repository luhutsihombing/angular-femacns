
// model untuk pada saat get (thinkware edit & view);
export interface Thinkware {
    active?: boolean;
    branch?: string;
    category?: string;
    codeProject?: string;
    createdBy?: string;
    createdDate?: string;
    department1?: string;
    department2?: string;
    id?: string;
    leaderName?: string;
    leaderNpk?: string;
    modifiedDate?: string;
    modifiedBy?: string;
    supervisor1?: string;
    supervisor2?: string;
    title?: string;
    detailsMember?: Array<
      {
        active?: true,
        createdDate?: Date;
        modifiedDate?: Date;
        createdBy?: string;
        modifiedBy?: string;
        fkIdMember?: string;
        id?: string;
        memberName?: string;
        memberNpk?: string;
        memberBranchCode?: string;
      }>;
    detailII?: {
        active: boolean;
        businessCase: string;
        costAndBenefit: string;
        categoryII: string;
        createdBy: string;
        createdDate: string;
        description: string;
        hdr_id: string;
        id: string;
        modifiedBy: string;
        modifiedDate: string;
        attachment?: Attachment[];
      };
    detailQCC?: {
        active: boolean;
        alternativeSolution: string;
        causeAnalysis: string;
        createdBy: string;
        createdDate: string;
        categoryQCC: string;
        goalStatement: string;
        hdr_id: string;
        id: string;
        modifiedBy: string;
        modifiedDate: string;
        performanceMapping: string;
        problem: string;
        processMapping: string;
        projectScope: string;
        solution: string;
        solutionDescription: string;
        attachment?: Attachment[];
      };
    detailQCP?: {
        active: boolean;
        alternativeSolution: string;
        categoryQCP: string;
        causeAnalysis: string;
        createdBy: string;
        createdDate: string;
        goalStatement: string;
        hdr_Id: string;
        id: string;
        modifiedBy: string;
        modifiedDate: string;
        performanceMapping: string;
        problem: string;
        processMapping: string;
        projectScope: string;
        solution: string;
        solutionDescription: string;
        attachment?: Attachment[];
      };
    detailSS?: {
        active: boolean,
        cause: string;
        createdBy: string;
        createdDate: string;
        hdr_id: string;
        id: string;
        modifiedBy: string;
        modifiedDate: string;
        problem: string;
        solution: string;
        attachment?: Attachment[];
      };
}

// Digunakan sebagai model untuk save
export interface ThinkwareSave {
    active?: boolean;
    branch?: string;
    category?: string;
    codeProject?: string;
    createdBy?: string;
    createdDate?: Date;
    department1?: string;
    department2?: string;
    detailII?: DetailII;
    detailQCC?: DetailQCC;
    detailQCP?: DetailQCP;
    detailSS?: DetailSS;
    detailsMember?: DetailMember[];
    id?: string;
    leaderName?: string;
    leaderNpk?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
    status?: string;
    supervisor1?: string;
    supervisor2?: string;
    title?: string;
}

// detail II untuk save
export interface DetailII {
    active?: boolean;
    attachment?: Attachment[];
    businessCase?: string;
    categoryII?: string;
    costAndBenefit?: string;
    createdBy?: string;
    createdDate?: Date;
    description?: string;
    hdr_id?: string;
    id?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
}

// detail QCC untuk save
export interface DetailQCC {
    active?: boolean;
    attachment?: Attachment[];
    alternativeSolution?: string;
    categoryQCC?: string;
    causeAnalysis?: string;
    createdBy?: string;
    createdDate?: Date;
    goalStatement?: string;
    hdr_id?: string;
    id?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
    performanceMapping?: string;
    problem?: string;
    processMapping?: string;
    projectScope?: string;
    solution?: string;
    solutionDescription?: string;
}

// detail QCP untuk save
export interface DetailQCP {
    active?: boolean;
    alternativeSolution?: string;
    categoryQCP?: string;
    causeAnalysis?: string;
    createdBy?: string;
    createdDate?: Date;
    goalStatement?: string;
    hdr_id?: string;
    id?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
    performanceMapping?: string;
    problem?: string;
    processMapping?: string;
    projectScope?: string;
    solution?: string;
    solutionDescription?: string;
    attachment?: Attachment[];
}

// detail SS untuk save
export interface DetailSS {
    active?: boolean;
    attachment?: Attachment[];
    cause?: string;
    createdBy?: string;
    createdDate?: Date;
    hdr_id?: string;
    id?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
    problem?: string;
    solution?: string;
}

// model member *sementara untuk save doang
export interface DetailMember {
    active?: boolean;
    attachment?: Attachment[];
    branch?: string;
    createdBy?: string;
    createdDate?: Date;
    fkIdMember?: string;
    id?: string;
    memberName?: string;
    memberNpk?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
}

// model attachment untuk save
export interface Attachment {
    active?: boolean;
    createdBy?: string;
    createdDate?: Date;
    deleted?: boolean;
    fkAttach?: string;
    fullPath?: string;
    id?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
    type: string;
}

// model untuk mencari nama branch dari glCode *digunakan saat menampilkan data search
export class BranchNameMapList {
    active?: boolean;
    companyCode?: string;
    createdBy?: string;
    createdDate?: Date;
    kode?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
    nama?: string;
  }

// model untuk mencari glCode dari branchCode *digunakan di branch baik di create,edit,view,search
export class GlCodeMapList {
    active?: boolean;
    branchCode?: string;
    branchName?: string;
    createdBy?: string;
    createdDate?: Date;
    glCode?: string;
    kode?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
}


// API_THINKWARE_POST_SEARCH model untuk search *yang dikirim
export interface ThinkwareSearchTerm {
    branch: string;
    category: string;
    codeProject: string;
    endDateProposal: string;
    endDateRisalah: string;
    memberName: string;
    startDateProposal: string;
    startDateRisalah: string;
    status: string;
    title: string;
    username: string;
}

// model untuk menampung hasil search
export interface ThinkwareSearchItem {
    active: boolean;
    branch: string;
    branchName?: string;
    branchValid?: boolean;
    category: string;
    createdDateProposal: string;
    createdDateRisalah: string;
    createdBy: string;
    department1: string;
    department2: string;
    flagBranch?: string;
    flagMember?: string;
    glCode?: string;
    id: string;
    leader: boolean;
    modifiedBy: string;
    pic: boolean;
    title: string;
    status: string;
}

// model yang digunakan untuk kirim cari branchName
export interface BranchName {
    id: string;
}

// model untuk suggest title di menu search
export interface TitleSuggestion {
    id: string;
    title: string;
}

// model untuk menampung suggest branch dari server
export interface BranchSuggestion {
    branchCode: string;
    branchName: string;
    glCode: string;
}

// model yang digunakan untuk menampung suggestion branch dari glCode dari server
export interface GlcodeSuggestion {
    branch: string;
    branchCode: string;
    branchName: string;
    glCode: string;
    id: string;
}

// model untuk menampung suggestion code project di menu search
export interface CodeSuggestion {
    id: string;
    codeProject: string;
}

// model untuk menampung suggestion employee baik leader maupun member di create, edit
export interface ThinkwareSuggestion {
    active?: boolean;
    birthDate?: Date;
    createdBy?: string;
    createdDate?: Date;
    dept1?: string;
    email?: string;
    firstName?: string;
    fullName?: string;
    idBranch?: string;
    idCompany?: string;
    idJob?: string;
    idJobGroup?: string;
    idOrganization?: string;
    institution?: string;
    lastName?: string;
    manager?: boolean;
    modifiedBy?: string;
    modifiedDate?: Date;
    nomorPokok?: string;
    personId?: string;
    phoneNumber?: string;
    type?: string;
    username?: string;
}

// faisal lebih tau
export interface ThinkwareDetailItem {
    endDate: string;
    materialAndSpeakers: Array<{}>;
    startDate: string;
    title: string;
    totalParticipant: number;
    lastPage: number;
    localOnly: boolean;
    message: string;
    pageSize: number;
    statusCode: number;
    timestamp: number;
}

// model untuk menampung department saat pencarian organization 2
export interface Dept2 {
    personId: string;
    employeeNo: string;
    spvOrg1: string;
    spvOrg2: string;
    spvOrgName1: string;
    spvOrgName2: string;
    spvName1: string;
    spvName2: string;
}

// faisal lebih tau
export interface Sub {
    active: boolean;
    value: string;
    label: string;
}

// entahlah
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

// model untuk cek PIC atau bukan dari username login digunakan di semua halaman thinkware
export interface IsPIC {
    pic: boolean;
    npk: string;
    idCompany: string;
    branchCode: string;
}

// model untuk mencari department di saat create, edit
export interface Department {
    companyId: string;
    department2: string;
    organizationId: string;
}

// model untuk mencari supervisor
export interface Supervisors {
    supervisor1: string;
    supervisor2: string;
}

// model untuk menampung lookup *sebenarnya tidak digunakan hanya untuk attachment
export interface LookupAttachment {
    detailCode: string;
    description: string;
    meaning: string;
}
