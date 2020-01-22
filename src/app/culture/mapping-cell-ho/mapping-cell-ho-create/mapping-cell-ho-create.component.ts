import {ActionResponse, ErrorResponse} from '../../../_model/app.model';
import {LookupService} from '../../../lookup/_service/lookup.service';
import {Organization} from '../_model/mapping-cell-ho.model';
import {FormGroup, FormBuilder, Validators, FormArray, AbstractControl} from '@angular/forms';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import * as $ from 'jquery';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {MappingHOValidator} from '../_validator/mapping-ho.validator';
import {MappingHOService} from '../_service/mapping-ho.service';

@Component({
    selector: 'fema-cms-mapping-cell-ho-create',
    templateUrl: './mapping-cell-ho-create.component.html',
    styleUrls: ['./mapping-cell-ho-create.component.scss']
})
export class MappingCellHoCreateComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    mappingForm: FormGroup;

    lookup: {
        minChar: number;
    };
    suggestion: {
        organizations: Organization[];
        employees: Array<{ label: string; value: string }>;
    };

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        cancelModalIsOpen: boolean;
        isSaving: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
    };

    readonly ngForTracker: Function = (idx: number): number => idx;

    get disableRemoveSelected(): boolean {
        return this.organizationsForm.controls.length < 1;
    }

    get employeeDatalist(): string {
        return this.mappingForm.get('pembinaUtama').value.length >= this.lookup.minChar ? 'employeeSuggestion' : '';
    }

    get organizationsForm(): FormArray {
        return <FormArray>this.mappingForm.get('organizations');
    }

    private createOrgForm(): FormGroup {

        const orgForm = this.fb.group({
            selected: false,
            orgCode: ['', Validators.required, this.mappingHOValidator.uniqueOrganization()]
        });

        orgForm.get('orgCode').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(orgCode => {

                const selectedOrg: Organization = this.suggestion.organizations
                    .find(orgSuggestion => orgSuggestion.orgCode === orgCode);

                if (selectedOrg) {
                    orgForm.get('orgCode').patchValue(selectedOrg.orgCode || '', {emitEvent: false});
                }

                this.organizationsForm.controls.forEach(org => org.get('orgCode').updateValueAndValidity());

            });

        return orgForm;

    }

    constructor(
        private fb: FormBuilder,
        private mappingHoSvc: MappingHOService,
        private lookupSvc: LookupService,
        private mappingHOValidator: MappingHOValidator,
    ) {

        this.mappingForm = fb.group({
            cellName: ['', Validators.required, this.mappingHOValidator.uniqueCellName()],
            pembinaUtama: ['', Validators.required, this.mappingHOValidator.uniquePembinaUtama()],
            organizations: fb.array([]),
            selectAllOrganizations: false
        });

        this.lookup = {
            minChar: 2
        };

        this.suggestion = {
            organizations: [],
            employees: []
        };

        this.uiState = {
            cancelModalIsOpen: false,
            isSaving: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.mappingForm.get('selectAllOrganizations').valueChanges.subscribe(selectAll =>
            this.organizationsForm.controls.forEach(organizationsForm => organizationsForm.get('selected').patchValue(selectAll))
        );

        this.mappingForm.get('pembinaUtama').valueChanges
            .pipe(
                debounceTime(300),
                filter(pembinaUtama => pembinaUtama && pembinaUtama.length >= this.lookup.minChar),
                distinctUntilChanged(),
                switchMap(pembinaUtama => this.mappingHoSvc.getEmployeeSuggestions(pembinaUtama))
            )
            .subscribe(employees => this.suggestion.employees = employees);

        this.addChild();

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.mappingHoSvc.getOrganizationSuggestions()
        )
            .subscribe(
                response => [
                    this.lookup.minChar,
                    this.suggestion.organizations,
                ] = response,
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    addChild(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.organizationsForm.push(this.createOrgForm());

    }

    removeSelected(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.organizationsForm
            .getRawValue()
            .map((respForm, idx) => respForm.selected ? idx : -1)
            .filter(idx => idx > -1)
            .reverse()
            .forEach(idx => this.organizationsForm.removeAt(idx));

        this.mappingForm.get('selectAllOrganizations').patchValue(false, {emitEvent: false});

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.responseOnAction = undefined;
        this.uiState.saveIsPressed = true;

        const noOrganization: boolean = this.organizationsForm.length === 0;

        if (this.mappingForm.valid && !noOrganization) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

        } else if (noOrganization) {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                type: 'ErrorResponse',
                message: 'Please, select at least 1 organization'
            };

        } else {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                type: 'ErrorResponse',
                message: 'Please checked marked field(s)'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        }

    }

    checkOrganizationName(evt: Event, controlName: string[]) {

        evt.preventDefault();

        let isValidResp = true;

        const ctrlIdx: number = +controlName[1];

        const filteredVals = this.organizationsForm
            .getRawValue()
            .map((resp, idx) => (idx !== ctrlIdx ? resp : null))
            .filter(resp => resp !== null);

        if (this.suggestion.organizations) {

            isValidResp =
                this.suggestion.organizations
                    .findIndex(resp => `${resp.orgCode}-${resp.orgName}` === this.mappingForm.get(controlName).value) > -1
                && filteredVals
                    .findIndex(resp => `${resp.orgCode}-${resp.orgName}` === this.mappingForm.get(controlName).value) === -1;

        }

        if (!isValidResp) {
            this.mappingForm.get(controlName).reset();
        }

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.mappingForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }

    save(): void {

        this.uiState.isSaving = true;

        this.mappingHoSvc
            .save(this.mappingForm.getRawValue())
            .pipe(
                finalize(() => {

                    this.uiState.isSaving = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                success => {
                    this.responseOnAction = {...success, type: 'GenericResponse'};
                    this.uiState.saveSuccessModalIsOpen = true;
                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

}
