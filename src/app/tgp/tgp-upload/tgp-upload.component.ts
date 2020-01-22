import { HcmsService } from './../../_service/hcms.service';
import * as $ from 'jquery';
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {concatMap, finalize} from 'rxjs/operators';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActionResponse, ErrorResponse, HTMLInputEvent} from '../../_model/app.model';
import {STANDARD_MONTHS_SELECTION, STANDARD_NON_STRING_SELECTION} from '../../_const/standard.const';
import {TgpProcess} from './tgp-upload.model';
import {TgpUploadService} from './tgp-upload.service';
import {Router} from '@angular/router';

@Component({
    selector: 'fema-cms-tgp-upload',
    templateUrl: './tgp-upload.component.html',
    styleUrls: ['./tgp-upload.component.scss']
})
export class TgpUploadComponent implements OnDestroy, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    tgpForm: FormGroup;

    monthSelections: Array<{ value: number; label: string; }>;

    processedUpload: TgpProcess;
    failedRecordUrl: string;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        processUploadDone: boolean;
        cancelModalIsOpen: boolean;
        closeIsPressed: boolean;
        closeModalIsOpen: boolean;
        closeSuccessModalIsOpen: boolean;
        isProcessing: boolean;
        processIsPressed: boolean;
        processModalIsOpen: boolean;
        selectedFileIsValid: boolean;
        successModalIsOpen: boolean;
        alertCloseWarning: boolean;
        fileUploadInvalid: boolean;
        templateIsDownloading: boolean;
    };

    constructor(
        fb: FormBuilder,
        private router: Router,
        private tgpUlSvc: TgpUploadService,
        private hcmsSvc: HcmsService,
    ) {

        this.monthSelections = STANDARD_NON_STRING_SELECTION.concat(STANDARD_MONTHS_SELECTION);

        this.tgpForm = fb.group({

            achievementNational: [null, [
                            Validators.required,
                            Validators.min(0),
                            Validators.max(2147483647),
                            Validators.pattern(/^([0-9])+$/)]],
            file: [null, Validators.required],
            month: [null, Validators.required],
            targetNational: [null, [Validators.required, Validators.min(0), Validators.max(2147483647), Validators.pattern(/^([0-9])+$/)]],
            year: [null, [Validators.required, Validators.min(0), Validators.max(2147483647), Validators.pattern(/^([0-9])+$/)]],
        });

        this.uiState = {
            processUploadDone: false,
            cancelModalIsOpen: false,
            closeModalIsOpen: false,
            closeIsPressed: false,
            closeSuccessModalIsOpen: false,
            isProcessing: false,
            processIsPressed: false,
            processModalIsOpen: false,
            selectedFileIsValid: true,
            successModalIsOpen: false,
            alertCloseWarning: false,
            fileUploadInvalid: false,
            templateIsDownloading: false
        };

    }

    ngOnInit() {

        this.tgpForm.get('file').valueChanges.subscribe(file => this.uiState.fileUploadInvalid = false);
    }

    ngOnDestroy() {

        URL.revokeObjectURL(this.failedRecordUrl);

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.processIsPressed = true;
        this.uiState.alertCloseWarning = false;

         if (this.invalidField(this.tgpForm) && !this.uiState.selectedFileIsValid) {
            this.uiState.fileUploadInvalid = true;
            this.uiState.selectedFileIsValid = true;
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else if (this.invalidField(this.tgpForm)) {
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else if (!this.uiState.selectedFileIsValid) {
            this.uiState.fileUploadInvalid = true;
            this.uiState.selectedFileIsValid = true;
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else {
            this.uiState.processModalIsOpen = true;

        }

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.tgpForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] && this.uiState.processIsPressed : false;

        }

        return ctrl.invalid && this.uiState.processIsPressed;

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.tgpForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

    selectFile(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.tgpForm.get('file').patchValue(evt.target.files.item(0));
        if (!this.tgpForm.get('file').value || this.tgpForm.get('file').value.type !== 'application/vnd.ms-excel') {
            this.uiState.selectedFileIsValid = false;

        }

    }

    processFile(): void {

        this.uiState = {
            ...this.uiState,
            isProcessing: true,
            processIsPressed: false,
            processModalIsOpen: false
        };

        this.responseOnAction = undefined;

        this.tgpUlSvc
            .process(this.tgpForm.get('file').value, this.tgpForm.getRawValue())
            .pipe(
                concatMap(processedUpload => {

                    this.processedUpload = processedUpload.data || {} as TgpProcess;

                    return this.tgpUlSvc.getFailedRecord(this.processedUpload.headerId);

                }),
                finalize(() => {

                    this.uiState.isProcessing = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                failedRecordUrl => {
                    this.failedRecordUrl = failedRecordUrl;
                    this.uiState.processUploadDone = true;
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    this.uiState.processUploadDone = true;
                }
            );

    }

    getFailedRecord(evt: Event): void {

        evt.preventDefault();

        const aEle: ElementRef['nativeElement'] = document.createElement('a');

        document.body.appendChild(aEle);

        aEle.style = 'display: none';
        aEle.download = `FEMA-TGP-FAILED-RECORD-(${this.tgpForm.get('file').value.name.split('.xls')[0]}).xls`;
        aEle.href = this.failedRecordUrl;

        aEle.click();

        URL.revokeObjectURL(aEle.href);

    }

    openCancelModal(evt: Event): void {

        evt.preventDefault();
        this.uiState.cancelModalIsOpen = true;

    }

    openCloseModal(evt: Event): void {

        evt.preventDefault();
        if (this.uiState.processUploadDone) {
            this.uiState.closeModalIsOpen = true;
        } else {
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            this.uiState.alertCloseWarning = true;
        }

    }

    closeTgp(): void {
            this.uiState.closeIsPressed = true;

            this.tgpUlSvc
                    .generateCoupon()
                    .pipe(
                        finalize(() => {
                            this.uiState.closeIsPressed = false;
                            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                        })
                    )
                    .subscribe(
                        success => {
                            this.responseOnAction = {...success, type: 'GenericResponse'};
                            this.uiState.closeSuccessModalIsOpen = true;
                        },
                        error => this.responseOnAction = {...error, type: 'ErrorResponse'},
                    );
            }

    getTemplate(evt: Event): void {

        evt.preventDefault();

        this.uiState.templateIsDownloading = true;

        this.hcmsSvc.getUploadTemplateTGP()
            .pipe(
                finalize(() => this.uiState.templateIsDownloading = false)
            )
            .subscribe(templateUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.download = `FEMA-TGP-TEMPLATE-(${new Date().getTime()}).xls`;
                aEle.href = templateUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }
    }
