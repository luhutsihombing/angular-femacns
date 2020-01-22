import { ApprovalSearchItem, WorkflowSearchTerm, WorkflowSave,
    AvmApproverEntities,
    AvmApproverMapping, 
    AvmLevelEntities,
    AvmVersionEntities,
    AvmMappingHeaderEntity,
    Workflow,
     } from '../model/workflow.model';
import { WorkflowService } from '../service/workflow.service';
import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {concatMap} from 'rxjs/operators';
import { LookupService } from '../../lookup/_service/lookup.service';

@Component({
    selector: 'fema-cms-workflow-view',
    templateUrl: './setup-approval-view.component.html',
    styleUrls: ['./setup-approval-view.component.scss']    
})
export class ApprovalViewComponent implements OnInit {
    
    setupview : Workflow;
    error: any;
    uiState: {
        cancelModalIsOpen: boolean;
    };
    transact: any[] = [
        {value : '', label: '-- Please Select --'}
    ];
    approveType: any[] = [
        {value: '', label: '- Please Select -'}
    ];
    approve: any[] = [
        {value: '', label: '- Please Select -'}
    ];
    constructor(
        private ar: ActivatedRoute,
        private location: Location,
        private lookupSvc: LookupService,
        private workflowSvc: WorkflowService
    ) {
        
        this.uiState = {
            cancelModalIsOpen: false
        };
    }


    ngOnInit() {
        this.ar.params
            .pipe(concatMap(params => this.workflowSvc.getSetupId(params.id)))
            .subscribe(setupview => {this.setupview = setupview;
            
            }, error => (this.error = error));

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
       
    }
    back(evt: Event): void {

        evt.preventDefault();

        window.history.back();

    }
}