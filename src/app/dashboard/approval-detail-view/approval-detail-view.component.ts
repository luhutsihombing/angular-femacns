import {Component, OnInit, ElementRef, ViewChild, AfterViewChecked} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DashboardService} from '../_service/dashboard.service';
import {switchMap, finalize} from 'rxjs/operators';
import {Location} from '@angular/common';
import {NotificationMessage, ApprovalSearchItem, Approve} from '../_model/dashboard.model';
import {ErrorResponse, ActionResponse} from '../../_model/app.model';
import * as $ from 'jquery';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'fema-cms-approval-message-view',
    templateUrl: './approval-detail-view.component.html',
    styleUrls: ['./approval-detail-view.component.scss']
})
export class ApprovalMessageViewComponent implements OnInit, AfterViewChecked {
    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    @ViewChild('domApprovalMessageBody') domApprovalMessageBody: ElementRef;
    approvalDetail: ApprovalSearchItem;
    responseOnAction: ActionResponse;
    errorOnInit: ErrorResponse;
    uiState: {
        isApprove: boolean;
        isReject: boolean;
        saveSuccessModalIsOpen: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        rejectSuccessModalIsOpen: boolean;
        rejectModalIsOpen: boolean;
    };
    //form group
    detailForm: FormGroup;

    constructor(
        private ar: ActivatedRoute,
        private loc: Location,
        private dashboardSvc: DashboardService,
        private fb: FormBuilder,
    )
     {
        this.detailForm = fb.group({
            remark: [''],
        });
        this.uiState = {
            isApprove: false,
            saveSuccessModalIsOpen: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            isReject: false,
            rejectSuccessModalIsOpen: false,
            rejectModalIsOpen: false,
        };
    }

    ngOnInit() {

        this.initialSetup();

        

    }
    checkFormValidity(evt?: Event): void {

        evt.preventDefault();
        
        this.uiState = {
            ...this.uiState,
            saveIsPressed: false,
            saveModalIsOpen: true,
            rejectModalIsOpen: true
        };
    }
    save(): void {

        this.uiState.isApprove = true;
        const approve: Approve = {
            avmTransactionEntity : {
                id : this.approvalDetail.id,
            },
            remarks : this.detailForm.get('remark').value,
            avmActionType : 'APPROVE_TRX',
            submitFrom : 'CMS'      
        };
        const saveObs = this.dashboardSvc.approve(approve).pipe();
       
        saveObs.pipe(
            finalize(() => {
                this.uiState.isApprove = false;
                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            })
        )
            .subscribe(
                () => this.uiState.saveSuccessModalIsOpen = true,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );
        }


        reject(): void {

            this.uiState.isReject = true;
            const reject: Approve = {
                avmTransactionEntity : {
                    id : this.approvalDetail.id,
                },
                remarks : this.detailForm.get('remark').value,
                avmActionType : 'REJECT_TRX',
                submitFrom : 'CMS'      
            };
            const rejectObs = this.dashboardSvc.approve(reject).pipe();
           
            rejectObs.pipe(
                finalize(() => {
                    this.uiState.isReject = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                })
            )
                .subscribe(
                    () => this.uiState.rejectSuccessModalIsOpen = true,
                    error => this.responseOnAction = {...error, type: 'ErrorResponse'}
                );
            }
    
    initialSetup(): void {

        this.ar.params
            .pipe(switchMap(params =>
                this.dashboardSvc.getApprovalId(params.id)))
            .subscribe(
                approvalDetail => this.approvalDetail = approvalDetail,
                error => this.errorOnInit = {...error, type: 'ErrorResponse'}
            );

    }

    ngAfterViewChecked() {

        if (this.domApprovalMessageBody && this.domApprovalMessageBody.nativeElement) {
            this.domApprovalMessageBody.nativeElement.innerHTML = this.approvalDetail.body;
        }

    }

    back(evt: Event): void {

        evt.preventDefault();

        this.loc.back();

    }

}
