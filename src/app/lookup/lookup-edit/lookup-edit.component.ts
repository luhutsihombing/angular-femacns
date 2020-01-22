import {REGEX_NUMERIC, REGEX_TEXT, REGEX_DATE} from '../../_const/regex.const';
import * as $ from 'jquery';
import {ActivatedRoute} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Lookup, LookupDetail} from '../_model/lookup.model';
import {LookupService} from '../_service/lookup.service';
import {distinctUntilChanged, finalize, switchMap} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {LookupValidator} from '../_validator/lookup.validator';
import {FemaService} from '../../_service/fema.service';

@Component({
    selector: 'fema-cms-lookup-edit',
    templateUrl: './lookup-edit.component.html',
    styleUrls: ['./lookup-edit.component.scss'],
    providers: [FemaService, LookupValidator]
})
export class LookupEditComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    dataTypes: Array<{ label: string; value: string }>;
    lookupForm: FormGroup;

    lookup: Lookup;
    validatorsType: string;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        cancelModalIsOpen: boolean;
        isSaving: boolean;
        saveSuccessModalIsOpen: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
    };

    get detailsForm(): FormArray {
        return <FormArray>this.lookupForm.get('details');
    }

    constructor(
        private ar: ActivatedRoute,
        private fb: FormBuilder,
        private femaSvc: FemaService,
        private lookupSvc: LookupService,
        private lookupValidator: LookupValidator
    ) {

        this.dataTypes = [
            {
                label: '—Please select—',
                value: ''
            },
            {
                label: 'NUMERIC',
                value: 'NUMERIC'
            },
            {
                label: 'TEXT',
                value: 'TEXT'
            },
            {
                label: 'DATE',
                value: 'DATE'
            }
        ];

        this.lookupForm = fb.group({
            name: [{value: '', disabled: true}, [Validators.required, Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.maxLength(250)]],
            dataType: [{value: this.dataTypes[0].value, disabled: true}, Validators.required],
            details: fb.array([]),
            selectAllDetails: false
        });

        this.uiState = {
            cancelModalIsOpen: false,
            isSaving: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false
        };

    }

    ngOnInit() {

        this.initialSetup();

    }

    private createDetailForm(lookupDetail?: LookupDetail): FormGroup {

        let regex: RegExp;

        switch (this.lookupForm.getRawValue().dataType) {

            case 'NUMERIC':
                regex = REGEX_NUMERIC;
                break;

            case 'TEXT':
                regex = REGEX_TEXT;
                break;

            case 'DATE':
                regex = REGEX_DATE;
                break;

        }

        const detailForm = this.fb.group({
            selected: {value: false, disabled: !!lookupDetail},
            detailCode: [lookupDetail ? lookupDetail.detailCode : '', [Validators.required, Validators.maxLength(30)]],
            meaning: [
                lookupDetail ? lookupDetail.meaning : '',
                [Validators.required, Validators.maxLength(50), Validators.pattern(regex), this.lookupValidator.minMeaning()]
            ],
            description: [lookupDetail ? lookupDetail.description : '', [Validators.required, Validators.maxLength(250)]],
            active: [lookupDetail ? lookupDetail.active : false, Validators.required],
            dataType: [this.lookupForm.getRawValue().dataType, Validators.required]
        });

        detailForm.get('detailCode').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(() => detailForm.get('meaning').updateValueAndValidity({emitEvent: false, onlySelf: true}));

        return detailForm;

    }

    initialSetup(): void {

        this.detailsForm.disable();

        this.lookupForm.get('selectAllDetails').valueChanges.subscribe(selectAll =>
            this.detailsForm.controls.forEach(
                detailsForm =>
                    detailsForm.get('selected').enabled ? detailsForm.get('selected').patchValue(selectAll) : null
            )
        );

        const revalidateDetails: Function = (regex: RegExp, dataType: string) =>
            this.detailsForm.controls.forEach(control => {
                control
                    .get('meaning')
                    .setValidators([Validators.required, Validators.maxLength(50), Validators.pattern(regex)]);
                control.get('meaning').updateValueAndValidity({onlySelf: true});
                control.get('dataType').patchValue(dataType);
            });

        this.lookupForm.get('dataType').valueChanges.subscribe(dataType => {

            dataType ? this.detailsForm.enable() : this.detailsForm.disable();

            switch (dataType) {

                case 'NUMERIC':
                    this.validatorsType = 'NUMERIC';
                    revalidateDetails(REGEX_NUMERIC, dataType);
                    break;

                case 'TEXT':
                    this.validatorsType = 'TEXT';
                    revalidateDetails(REGEX_TEXT, dataType);
                    break;

                case 'DATE':
                    this.validatorsType = 'DATE';
                    revalidateDetails(REGEX_DATE, dataType);
                    break;

            }

        });

        this.ar.params
            .pipe(switchMap(params => this.lookupSvc.getLookup(params.name)))
            .subscribe(lookup => {

                    this.lookup = lookup;

                    this.lookupForm.patchValue(lookup);

                    for (const lookupDetail of lookup.details) {
                        this.addChild(lookupDetail);
                    }

                    this.detailsForm.controls.forEach(control => {
                        control.get('selected').disable();
                        control.get('detailCode').disable();
                    });

                },
                error => this.errorOnInit = error
            );

    }

    addChild(lookupDetail?: LookupDetail): void {

        const detailForm: FormGroup = lookupDetail ? this.createDetailForm(lookupDetail) : this.createDetailForm();

        this.detailsForm.push(detailForm);

        detailForm.get('selected').valueChanges.subscribe(() => {
            setTimeout(() => {
                let allSelected: boolean | boolean[] = this.detailsForm.value
                    .map(form => form.selected)
                    .filter(selected => typeof selected === 'boolean');

                allSelected = (<boolean[]>allSelected).reduce(
                    (prevVal, currVal) => prevVal && currVal,
                    allSelected[0] || false
                );

                this.lookupForm.get('selectAllDetails').patchValue(allSelected, {emitEvent: false});
            });
        });
    }

    checkDetailCode(evt: Event, controlName: string[]) {

        evt.preventDefault();

        setTimeout(() => {

            const isDuplicate: boolean = !!this.detailsForm
                .getRawValue()
                .map((detail, index) => (index !== +controlName[1] ? detail : null))
                .filter(detail => detail !== null)
                .find(detail => detail.detailCode === this.lookupForm.get(controlName).value);

            if (isDuplicate) {
                this.lookupForm.get(controlName).reset();
            }

        });

    }

    removeSelected(evt: Event): void {

        evt.preventDefault();

        this.detailsForm
            .getRawValue()
            .map((detail, idx) => (detail.selected ? idx : -1))
            .filter(idx => idx > -1)
            .reverse()
            .forEach(idx => this.detailsForm.removeAt(idx));

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.lookupForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        // this.lookupForm.getRawValue().details.map(result => {
        //     if (result.detailCode === 'CON_MAX_ACTIVE_BANNER' && result.meaning < 1) {
        //         this.invalid = true;
        //         this.responseInvalid = 'Meaning CON_MAX_ACTIVE_BANNER must be greater than 0 ';
        //     }
        //     if (result.detailCode === 'CON_MAX_ACTIVE_POPUP' && result.meaning < 1) {
        //         this.invalid = true;
        //         this.responseInvalid = ' CON_MAX_ACTIVE_POPUP must be greater than 0 ';
        //     }
        // });

        console.warn(this.femaSvc.getAllNestedErrors(this.lookupForm));

        if (this.lookupForm.valid) {

            this.uiState.saveModalIsOpen = true;

        } else {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        }

    }

    save(): void {

        this.lookupSvc.postSave({
            ...this.lookupForm.getRawValue(),
            name: this.lookupForm.get('name').value.toUpperCase(),
            details: this.lookupForm.getRawValue().details.map(({selected, ...others}) => others)
        })
            .pipe(
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

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.lookupForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

}
