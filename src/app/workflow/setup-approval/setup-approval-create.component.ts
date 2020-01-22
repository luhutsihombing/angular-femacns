import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup, FormBuilder, FormArray, Validators, AbstractControl} from '@angular/forms';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ClrDatagridStateInterface} from '@clr/angular';
import {MAT_DATE_FORMATS} from '@angular/material';
import {STANDARD_STRING_SELECTION_SELECT} from '../../_const/standard.const';
import {Subject, combineLatest, Observable, of} from 'rxjs';
import { tap, finalize, switchMap, filter} from 'rxjs/operators';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';
import {LookupService } from '../../lookup/_service/lookup.service';
import { AuthService } from '../../auth/_service/auth.service';
import { APPROVE_TYPES } from '../const/comment.cons';
import { ApprovalSearchItem, WorkflowSearchTerm, WorkflowSave,
        AvmApproverEntities,
        AvmApproverMapping, 
        AvmLevelEntities,
        AvmVersionEntities,
        AvmMappingHeaderEntity,
         } from '../model/workflow.model';
import { WorkflowService } from '../service/workflow.service';

@Component({
    selector: 'fema-cms-workflow-create',
    templateUrl: './setup-approval-create.html',
    styleUrls: ['./setup-approval-create.component.scss'],
    
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {dateInput: 'LL'},
                display: {
                    dateInput: 'DD-MMM-YYYY',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class ApprovalCreateComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    errorOnInit: ErrorResponse;
    
    //form group
    approvalForm: FormGroup;
    AvmVersion : FormGroup = null;
    AvmMapping : FormGroup = null;
    AvmLevel : FormGroup = null;
    AvmApprover: FormGroup = null;

    responseOnAction: ActionResponse;
    approveRequires: Array<{ value: string; label: string }>;
    approvalSearchList: PaginatedResponse<ApprovalSearchItem>;
    qParams: SearchPagination<WorkflowSearchTerm>;
    option: {
        transactions: Array<{ value: string, label: string }>;
        approverTypes: Array<{ value: string, label: string }>;
        approvers: Array<{ value: string, label: string }>;
    };
    transact: any[] = [
        {value: '', label: '- Please Select -'}
    ];
    approveType: any[] = [
        {value: '', label: '- Please Select -'}
    ];
    approve: any[] = [
        {value: '', label: '- Please Select -'}
    ];
    uiState: {
        startDateIsOpen: boolean;
        endDateIsOpen: boolean;
        isSearching: boolean;
        searchIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        isSaving: boolean;
        approverBtnIsDisable: boolean;
        saveIsPressed: boolean;
    };
    responseOnSave: any;
    approverCounter = 0;
    saveModalOpened: boolean;
    successModalOpened: boolean;
    cancelModalIsOpen: boolean;
    approveTypes: Array<{ value: string; label: string }>;
    lookup: {
        maxApprover?: number;       
    };
     
    set resetCalendar(formControlName: string) {
        this.approvalForm.get(formControlName).patchValue('');
    }
    constructor(
        private authSvc: AuthService,
        private ar: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private fb: FormBuilder,
        private workflowSvc: WorkflowService
    ) {
         
        this.clrPage = new Subject<ClrDatagridStateInterface>();
        this.approvalSearchList = {} as PaginatedResponse<ApprovalSearchItem>;
        this.approveRequires = STANDARD_STRING_SELECTION_SELECT.concat(APPROVE_TYPES);
        this.approvalForm = fb.group({
            avmName: [''],
            transactionType: ['', Validators.required],
            versionType: [''],
            approverType:['', Validators.required],
            approver:['', Validators.required],           
            startDate: [''],
            endDate: [''],
            transaction: [''], 
            approverRequireField: this.approveRequires[0].value,
            levelApproval: [''],
            approverForm: this.fb.array([])
        });
        
        this.AvmVersion = fb.group({
            versionNumber: [''],
            avmLevelEntities: ['', Validators.required],
            avmMappingHeaderEntity: ['', Validators.required],
            effectiveEndDate: [''],
            effectiveStartDate: [''],           
        })

        this.AvmMapping = fb.group({
            scope: [''], 
            transactionType: [''], 
        })

        this.AvmLevel = fb.group({
            levelName: [''],
            avmLevelMethod: [''],
            avmApproverEntities: [''],
        })

        this.AvmApprover = fb.group({
            approverName: [''],
        })
        
        this.cancelModalIsOpen = false; 
        this.saveModalOpened = false;
        this.successModalOpened = false;
        this.uiState = {
            isSearching: false,
            startDateIsOpen: false,
            endDateIsOpen: false,
            searchIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            isSaving: false,
            approverBtnIsDisable: false,
            saveIsPressed: false,
        };
        this.lookupSvc.getLookupDetailList('AVM_TRANSACTION_TYPE')
        .subscribe((fullData) => {
            for (let index = 0; index < fullData.dataList.length; index++) {
                if (fullData.dataList[index].active) {
                    const transaction = {
                        value: fullData.dataList[index].detailCode,
                        label: fullData.dataList[index].meaning
                    };
                    this.transact.push(transaction);
                }
            }
        });
        this.lookupSvc.getLookupDetailList('AVM_APPROVER_TYPE')
        .subscribe((fullData) => {
            for (let index = 0; index < fullData.dataList.length; index++) {
                if (fullData.dataList[index].active) {
                    const approverType = {
                        value: fullData.dataList[index].detailCode,
                        label: fullData.dataList[index].meaning
                    };
                    this.approveType.push(approverType);
                }
            }
        });
        this.lookupSvc.getLookupDetailList('AVM_APPROVER_SUPERVISOR')
        .subscribe((fullData) => {
            for (let index = 0; index < fullData.dataList.length; index++) {
                if (fullData.dataList[index].active) {
                    const approver = {
                        value: fullData.dataList[index].meaning,
                        label: fullData.dataList[index].description
                    };
                    this.approve.push(approver);
                }
            }
        });
        this.option = {
            transactions: this.transact,
            approverTypes: this.approveType,
            approvers: this.approve
            
        };
        this.lookup = {
            maxApprover: Number.POSITIVE_INFINITY
        };
    }

    ngOnInit() {
        this.initialSetup();
        this.addMember();
        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.approvalSearchList = {} as PaginatedResponse<ApprovalSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.approvalForm.patchValue(this.qParams.data);
                    
                    let httpSearch: Observable<PaginatedResponse<ApprovalSearchItem>> = of({} as PaginatedResponse<ApprovalSearchItem>);

                   
                    return httpSearch.pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                commentSearchList => this.approvalSearchList = commentSearchList,
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );
    }
    addMember() {
        if (this.approverCounter < this.lookup.maxApprover) {
            const approverForm = this.fb.group({
                approverType: ['', Validators.required],
                approver:[''],    
                approverRequireField: [''],
            });

            this.approverForms.push(approverForm);
            this.approverCounter++;

        } else {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Project member maksimal ' + this.lookup.maxApprover + ' orang',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        }
    }
    deleteMember(i) {
        this.approverForms.removeAt(i);
        this.approverCounter--;
    }
    get approverForms() {
        return this.approvalForm.get('approverForm') as FormArray;
    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS'),
            
        )
    };
    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.approvalForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }
    invalidFieldMember(index: number, control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.approverForms.at(index).get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }
    
    invalidtransactionType() {
        if (this.approvalForm.get('transactionType').value === '' && this.uiState.saveIsPressed) {
            return true;
        }
        return false;
    }
    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.approverForms.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }
    openCancelModal(evt: Event): void {

        evt.preventDefault();
        this.cancelModalIsOpen = true;

    }

    checkFormValidity(evt?: Event): void {

        evt.preventDefault();
        this.uiState.saveIsPressed = true;

        if (this.approvalForm.get('transactionType').value === '') {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else if ((!this.approvalForm.valid )) {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        }else if (this.approvalForm.valid ) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

            // menghilangkan alert ketika form telah valid
            this.responseOnAction = null;

        }
         
    }
    
    save(): void {

        this.uiState.isSaving = true;

         
         

        // mengisi payload
        const avmMappingEntity : AvmMappingHeaderEntity = {
            scope: 0,
            transactionType: this.approvalForm.get('transactionType').value,
        }
        
        const avmApproverEntityList : AvmApproverEntities[] = [];
        for (let i = 0; i < this.approverForms.length; i++) {

            const avmApproverMapping : AvmApproverMapping = {
                approverName : this.approverForms.at(i).get('approver').value,
            }

            const avmApproverEntity : AvmApproverEntities = {
            avmApproverMapping: avmApproverMapping,
            avmApproverType : this.approverForms.at(i).get('approverType').value,
            avmBasedOn:  'CURRENT_ASSIGNMENT'
        }
        avmApproverEntityList.push(avmApproverEntity);
        }

        const avmLevelEntityList : AvmLevelEntities[] = [];

        for (let i = 0; i < this.approverForms.length; i++) {
                const avmLevelEntity : AvmLevelEntities = {
                    levelName: 'tes',
                    avmLevelMethod :this.approverForms.at(i).get('approverRequireField').value,  //   'ANY';
                    avmApproverEntities: avmApproverEntityList,   
                }
            
            avmLevelEntityList.push(avmLevelEntity);
        }
       
        const avmVersionEntityList : AvmVersionEntities[] = [];

        for(let i = 0; i < this.approverForms.length; i++){
            const avmVersionEntity : AvmVersionEntities ={
                versionNumber: 1,
                effectiveEndDate: this.approvalForm.get('startDate').value,
                effectiveStartDate: this.approvalForm.get('endDate').value,
                avmLevelEntities: avmLevelEntityList,
                avmMappingHeaderEntity: avmMappingEntity
        }
            avmVersionEntityList.push(avmVersionEntity);
        }

        const workflowSave: WorkflowSave = {
            avmName: this.approvalForm.get('avmName').value, 
            active:true,  
            avmVersionEntities : avmVersionEntityList        
        };
    
        
        // akhir mengisi payload



        const saveObs = this.workflowSvc.saveThinkware(workflowSave).pipe();
       
        saveObs.pipe(
            finalize(() => {
                this.uiState.isSaving = false;
                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            })
        )
            .subscribe(
                () => this.uiState.saveSuccessModalIsOpen = true,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

   
}
