import * as Papa from 'papaparse/papaparse.min';
import {AssignmentService} from '../_service/assignment.service';
import {Component, ElementRef, OnInit} from '@angular/core';
import {HTMLInputEvent} from '../../_model/app.model';
import {ProcessedAssignment} from '../_model/assignment.model';
import {concatMap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-assignment-create',
    templateUrl: './assignment-create.component.html',
    styleUrls: ['./assignment-create.component.scss']
})
export class AssignmentCreateComponent implements OnInit {

    templateUrl: string;
    uploadedAssignment: File;
    assignment: ProcessedAssignment;
    assignmentBlob: Blob;
    assignmentData: any;

    fileIsValid: boolean;
    openProcessModal: boolean;
    openCloseModal: boolean;
    cancelModalOpened: boolean;

    constructor(
        private assignSvc: AssignmentService,
    ) {

        this.templateUrl = '';

        this.fileIsValid = true;

        this.openProcessModal = false;
        this.openCloseModal = false;
        this.cancelModalOpened = false;
    }

    ngOnInit() {
        this.assignSvc.getTemplate().subscribe(templateUrl => this.templateUrl = templateUrl);
    }

    selectUa(evt: HTMLInputEvent): void {
        evt.preventDefault();

        this.uploadedAssignment = evt.target.files.item(0);

        if (this.uploadedAssignment && this.uploadedAssignment.type === 'application/vnd.ms-excel') {

            this.uploadedAssignment = undefined;
            evt.target.value = null;

        }
    }

    processUa(evt: Event): void {

        evt.preventDefault();

        this.openProcessModal = false;

        this.assignSvc.processAssignment(this.uploadedAssignment)
            .pipe(
                concatMap(assignment => {
                    this.assignment = assignment;
                    return this.assignSvc.getProcessedAssignment(assignment.processedUrl);
                })
            )
            .subscribe(processedBlob => {
                this.assignmentBlob = processedBlob;

                Papa.parse(processedBlob, {
                    complete: assignmentrsedCsv =>
                        this.assignmentData = {
                            header: assignmentrsedCsv.data[0],
                            entries: assignmentrsedCsv.data.slice(1, -1),
                        },
                });
            });
    }

    getProcessedFile(evt: Event): void {

        evt.preventDefault();

        const aEle: ElementRef['nativeElement'] = document.createElement('a');

        document.body.appendChild(aEle);

        aEle.style = 'display: none';
        aEle.href = URL.createObjectURL(this.assignmentBlob);
        aEle.download = 'FEMA-PROCESSED-UPLOAD-ASSIGNMENT.xls';

        aEle.click();

        URL.revokeObjectURL(aEle.href);
    }

    openCancelModal(evt: Event): void {
        evt.preventDefault();
        this.cancelModalOpened = true;
    }
}
