
export interface WorkflowSearchTerm {
    
}
export interface ApprovalSearchItem {
    
}
export interface Workflow{
    avmName: string;
    active?: boolean;
    createdBy?: string;
    createdDate?: Date;
    id?: string;
    modifiedBy?: string;
    modifiedDate?: Date;
    effectiveEndDate?: Date;
        effectiveStartDate?: Date;
    avmVersionEntities? : Array<
      {
        versionNumber?: number;
        effectiveEndDate?: Date;
        effectiveStartDate?: Date;
        avmLevelEntities?: Array<{
          levelSequence?: number;
          levelName?: string;
          numberOfApprovals?: number;
          avmLevelMethod?: string; //   'ANY';
          avmApproverEntities?: Array<{
            levelSequence?: number;
						avmApproverType?: string;            //   'SUPERVISOR';
						avmBasedOn?: string;            //   'CURRENT_ASSIGNMENT';
						avmApproverMapping?: {
              approverName?: string;
							}
            }>;
          }>;
        avmMappingHeaderEntity?: {    
          scope?: number;
          transactionType?: string;
        }   
      }>;
    } 
  
// Digunakan sebagai model untuk save
export interface WorkflowSave {
    avmName: string;
    active?: boolean;
    avmVersionEntities : AvmVersionEntities[]; 

    // active?: boolean; 
    // activeVersions?: ActiveVersions;  
    // avmName?: string;
    // avmVersionEntities?: AvmVersionEntities;
    // createdBy?: string;
    // createdDate?: Date;
    // id?: string;
    // modifiedBy?: string;
    // modifiedDate?: Date;
}

// export interface ActiveVersions{
//     avmEntity?: {},
//     avmLevelEntities?: AvmLevelEntities;
//     avmMappingHeaderEntity: AvmMappingHeaderEntity;
//     createdBy?: string;
//     createdDate?: Date;
//     effectiveEndDate?: Date;
//     effectiveStartDate?: Date;
//     id?: string;
//     modifiedBy?: string;
//     modifiedDate?: Date;
//     versionNumber?: 0;

// }

export interface AvmMappingHeaderEntity{
    // avmVersionEntity?: {};
    // createdBy?: string;
    // createdDate?: Date;
    // id?: string;
    // modifiedBy?: string;
    // modifiedDate?: Date;
    // orgHierId?: 0;
    scope?: number;
    transactionType?: string;  // 'THINKWARE_RISALAH';
}

export interface AvmApproverEntities{
    avmApproverMapping?: AvmApproverMapping;
    avmApproverType?: string; // 'SUPERVISOR';
    avmBasedOn?: string;  // 'CURRENT_ASSIGNMENT';
    // avmLevelEntity?: {},
    // createdBy?: string;
    // createdDate?: Date;
    // id?: string;
    // levelSequence?: 0,
    // modifiedBy?: string;
    // modifiedDate?: Date;
}

export interface AvmVersionEntities{
    versionNumber?: number;
    effectiveEndDate?: Date;
    effectiveStartDate?: Date;
    avmLevelEntities?: AvmLevelEntities[];
    avmMappingHeaderEntity?: AvmMappingHeaderEntity; 

    // avmEntity?: {};
    // avmLevelEntities: AvmLevelEntities;
    // avmMappingHeaderEntity?: AvmMappingHeaderEntity; 
    // createdBy?: string;
    // createdDate?: Date;
    // effectiveEndDate?: Date;
    // effectiveStartDate?: Date;
    // id?: string;
    // modifiedBy?: string;
    // modifiedDate?: Date
    // versionNumber?: 0;
}

export interface AvmApproverMapping{
    approverName: string;
    // avmApproverEntity?: Array<{}>;
    // createdBy?: string;
    // createdDate?: Date;
    // id?: string;
    // modifiedBy?: string;
    // modifiedDate?: Date;
    // sequence?: 0;
}

export interface AvmLevelEntities{ 
    levelName: string;
    avmLevelMethod: string; //   'ANY';
    avmApproverEntities: AvmApproverEntities[];   
    // avmApproverEntities?: AvmApproverEntities; 
    // avmLevelMethod?: string;  // 'ANY';
    // avmVersionEntity?: {};
    // createdBy?: string;
    // createdDate?: Date;
    // id?: string;
    // levelName?: string;
    // levelSequence?: 0;
    // modifiedBy?: string;
    // modifiedDate?: Date;
    // numberOfApprovals?: 0;
    // rule?: string;      
}

export interface WorkflowSearch {
  group?: string;
  criterias?: Array<
  [{
        field?: string;
        operator?: string;
        value?: string;
   },					
    {
        field?: string;
        operator?: string;
        value?:string;
   }]>;
pagination? :
		{
			currentPage? : number;
			pageSize? : number;
			descending? : boolean;
			orderBy? : any[];
		}
}
 
 
export interface WorkflowSearchItem {
  active: boolean;
  id: string;
  avmName: string;
  avmVersionEntities? : Array<[{
    versionNumber?: number;
    effectiveEndDate?: Date;
    effectiveStartDate?: Date;
    avmMappingHeaderEntity?: Array<[{
        transactionType: string;
    }]>;
}]>;     

  modifiedBy: string;
  modifiedDate: Date;
}

export interface Criterias{
  
    field?: string;
    operator?: string;
    value?: string;


}

  //   activeVersions?: {
  //   avmEntity?: {},
  //   avmLevelEntities?: Array<
  //   {
  //       avmApproverEntities?: Array<
  //         {
  //           avmApproverMapping?: {
  //             approverName?: string;
  //             avmApproverEntity?: {},
  //             createdBy?: string;
  //             createdDate?: Date;
  //             id?: string;
  //             modifiedBy?: string;
  //             modifiedDate?: Date;
  //             sequence?: 0
  //           },
  //           avmApproverType?: string;            //   'SUPERVISOR';
  //           avmBasedOn?: string;            //   'CURRENT_ASSIGNMENT';
  //           avmLevelEntity?: {},
  //           createdBy?: string;
  //           createdDate?: Date;
  //           id?: string;
  //           levelSequence?: 0,
  //           modifiedBy?: string;
  //           modifiedDate?: Date;
  //         }
  //       >;
  //       avmLevelMethod?: string; //   'ANY';
  //       avmVersionEntity?: {},
  //       createdBy?: string;
  //       createdDate?: Date;
  //       id?: string;
  //       levelName?: string;
  //       levelSequence?: 0,
  //       modifiedBy?: string;
  //       modifiedDate?: Date;
  //       numberOfApprovals?: 0,
  //       rule?: string;
  //     }
  //   >;
  //   avmMappingHeaderEntity?: {      
  //       avmVersionEntity?: {};
  //       createdBy?: string;
  //       createdDate?: Date;
  //       id?: string;
  //       modifiedBy?: string;
  //       modifiedDate?: Date;
  //       orgHierId?: 0,
  //       scope?: 0;
  //       transactionType?: string;       // 'THINKWARE_RISALAH';
  //   },
  //   createdBy?: string;
  //   createdDate?: Date;
  //   effectiveEndDate?: Date;
  //   effectiveStartDate?: Date;
  //   id?: string;
  //   modifiedBy?: string;
  //   modifiedDate?: Date;
  //   versionNumber?: 0;
  // },
  // // avmName?: string;
  // avmVersionEntities?: Array<
  //   {
  //     avmEntity?: {};
  //     avmLevelEntities: Array<
  //       {
  //         avmApproverEntities?: Array<
  //           {
  //             avmApproverMapping?: {
  //               approverName?: string;
  //               avmApproverEntity?: {};
  //               createdBy?: string;
  //               createdDate?: Date;
  //               id?: string;
  //               modifiedBy?: string;
  //               modifiedDate?: Date;
  //               sequence?: 0;
  //             },
  //             avmApproverType?: string;            //   'SUPERVISOR';
  //             avmBasedOn?: string;            //   'CURRENT_ASSIGNMENT';
  //             avmLevelEntity?: {};
  //             createdBy?: string;
  //             createdDate?: Date;
  //             id?: string
  //             levelSequence?: 0;
  //             modifiedBy?: string;
  //             modifiedDate?: Date;
  //           }
  //       >;
  //         avmLevelMethod?: string; //   'ANY';
  //         avmVersionEntity?: {};
  //         createdBy?: string;
  //         createdDate?: Date;
  //         id?: string;
  //         levelName?: string;
  //         levelSequence?: 0;
  //         modifiedBy?: string;
  //         modifiedDate?: Date;
  //         numberOfApprovals?: 0;
  //         rule?: string;
  //       }>;
  //     avmMappingHeaderEntity?: {
  //       avmVersionEntity?: {};
  //       createdBy?: string;
  //       createdDate?: Date;
  //       id?: string;
  //       modifiedBy?: string;
  //       modifiedDate?: Date;
  //       orgHierId?: 0;
  //       scope?: 0;
  //       transactionType?: string;   //  'THINKWARE_RISALAH';
  //     },
  //     createdBy?: string;
  //     createdDate?: Date;
  //     effectiveEndDate?: Date;
  //     effectiveStartDate?: Date;
  //     id?: string;
  //     modifiedBy?: string;
  //     modifiedDate?: Date
  //     versionNumber?: 0;
  //   }>;