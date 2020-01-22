import { ViewChild, ElementRef, OnInit, Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MAT_DATE_FORMATS } from "@angular/material";
import { ClrDatagridStateInterface } from "@clr/angular";
import { Subject, combineLatest } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../auth/_service/auth.service";
import { LookupService } from "../../lookup/_service/lookup.service";
import { ActionResponse, ErrorResponse, SearchPaginationWorkflow } from "../../_model/app.model";
import { WorkflowSearchTerm, WorkflowSearch, WorkflowSearchItem } from "../model/workflow.model";
import { filter, tap, switchMap, debounceTime, distinctUntilChanged, finalize } from "rxjs/operators";
import { WorkflowService } from "../service/workflow.service";
import * as $ from 'jquery';
import { SearchUtil } from "../../_util/search.util";
import { PaginatedResponses } from "../../dashboard/_model/dashboard.model";

@Component({
    selector: 'fema-cms-workflow-search',
    templateUrl: './setup-approval-search.html',
    // styleUrls: ['./thinkware-search.component.scss'],
    
})
export class ApprovalSearchComponent implements OnInit {
  
    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    searchApprovalForm: FormGroup;
    clrPage: Subject<ClrDatagridStateInterface>;
    
    qParams: SearchPaginationWorkflow<WorkflowSearch>;
    workflowList: PaginatedResponses<WorkflowSearchItem>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    option: {
        transactions: Array<{ value: string, label: string }>;
        
    };
    lookup: {
        minChar: number;
        pageSize: number;
    };
    transacti: any[] = [
        {value: '', label: '- Please Select -'}
    ];
    uiState: {
        
            openWarningModal: boolean;
            reportIsDownloading: boolean;
            searchIsPressed: boolean;
        // detailModalIsOpen: boolean;
            isSearching: boolean;
    };
    
    // cek hasil akhir proposal atau risalah
    isNotStart: Array<String> = [];

   
    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPaginationWorkflow<WorkflowSearch>;

        if (this.qParams && this.workflowList.hasOwnProperty('content')) {
            term = {
                group: 'AND',
                criterias: [{
                    field: 'avmName',
                    operator: 'like',
                    value: this.searchApprovalForm.get('avmName').value,
            
               },					
                {
                    field:'avmVersionEntities.avmMappingHeaderEntity.transactionType',
                    operator: 'like',
                    value:this.searchApprovalForm.get('transactionType').value,
            
               }],
                pagination : {
                    descending: state && state.sort ? state.sort.reverse : false,
                    orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                    currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1,
                    // currentPage : this.qParams.pagination.currentPage,
                    pageSize : this.lookup.pageSize,
                    // descending : this.qParams.pagination.descending,
                    // orderBy : this.qParams.pagination.orderBy,
                }
            };

        } else if (this.qParams && !this.workflowList.hasOwnProperty('content')) {

            term = this.qParams;

        }

        this.router.navigate(['/workflow/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }
    constructor(
        private authSvc: AuthService,
        private ar: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private fb: FormBuilder,
        private workflowSearch: WorkflowService,
        private searchUtil: SearchUtil,
    ) {
        this.clrPage = new Subject<ClrDatagridStateInterface>();
        this.workflowList = {} as PaginatedResponses<WorkflowSearchItem>;
        this.uiState = {
            isSearching: false,
            openWarningModal: false,
            reportIsDownloading: false,
            searchIsPressed: false,
        };
        this.lookup = {
            minChar: 2,
            pageSize: 20
        };
         
        this.searchApprovalForm = fb.group({
            avmName: '', 
            transactionType: ''
 
        });
        this.lookupSvc.getLookupDetailList('AVM_TRANSACTION_TYPE')
        .subscribe((fullData) => {
            for (let index = 0; index < fullData.dataList.length; index++) {
                if (fullData.dataList[index].active) {
                    const transaction = {
                        value: fullData.dataList[index].detailCode,
                        label: fullData.dataList[index].meaning
                    };
                    this.transacti.push(transaction);
                }
            }
        });
        this.option = {
            transactions: this.transacti
            
        };

        
       

       

      

    }
    ngOnInit() {
         
        this.initialSetup();
        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.workflowList = {} as PaginatedResponses<WorkflowSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);

                    this.searchApprovalForm.patchValue(this.qParams.criterias);

                    return this.workflowSearch.postAreaList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                workflowList => {
                   
                    this.workflowList = workflowList;
                    console.log(this.workflowList);
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );
            this.clrPage.pipe(
                debounceTime(300),
                distinctUntilChanged((prevState, currentState) => JSON.stringify(prevState) === JSON.stringify(currentState)),
            ).subscribe(state => this.searchByPagination(state));
    }
    
    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS'),
            
        )
    };
    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        this.searchUtil.noSearchParams(this.searchApprovalForm.getRawValue())
            ? this.uiState.openWarningModal = true
            : this.searchByInput();

    }
    searchByInput(): void {
    
        this.uiState.openWarningModal = false;
        
        const criterias : any[]=[
            {
                field: 'avmName',
                operator: 'like',
                value: this.searchApprovalForm.get('avmName').value,
        
           },					
            {
                field:'avmVersionEntities.avmMappingHeaderEntity.transactionType',
                operator: 'like',
                value:this.searchApprovalForm.get('transactionType').value,
        
           }
        ]
        
        let term: SearchPaginationWorkflow<WorkflowSearch> = {
            group: 'AND',
            criterias:  criterias,
            pagination : {
                currentPage : 1,
                pageSize : this.lookup.pageSize,
                descending : false,
                orderBy : [],
            }
    };

    if (this.qParams && this.qParams.criterias) {

        if (JSON.stringify(this.qParams.criterias) === JSON.stringify(this.searchApprovalForm.getRawValue())) {
            const criterias : any[]=[
                {
                    field: 'avmName',
                    operator: 'like',
                    value: this.searchApprovalForm.get('avmName').value,
            
               },					
                {
                    field:'avmVersionEntities.avmMappingHeaderEntity.transactionType',
                    operator: 'like',
                    value:this.searchApprovalForm.get('transactionType').value,
            
               }
            ]

             term = {
                group: 'AND',
                criterias: criterias,
                pagination : {
                    currentPage : this.qParams.pagination.currentPage,
                    pageSize : this.lookup.pageSize,
                    descending : this.qParams.pagination.descending,
                    orderBy : this.qParams.pagination.orderBy,
                }
            };

        }

    }

    this.router.navigate(['/workflow/search'], {
        queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
        queryParamsHandling: 'merge'
    }).then();

}
}
