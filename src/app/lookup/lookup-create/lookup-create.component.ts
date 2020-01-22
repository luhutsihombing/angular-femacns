import * as $ from 'jquery';
import {Component, ElementRef, OnChanges, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LookupSaveTerm, Lookup} from '../_model/lookup.model';
import {LookupService} from '../_service/lookup.service';
import {REGEX_DATE, REGEX_NUMERIC, REGEX_TEXT} from '../../_const/regex.const';
import {variable} from '@angular/compiler/src/output/output_ast';

@Component({
    selector: 'fema-cms-lookup-create',
    templateUrl: './lookup-create.component.html',
    styleUrls: ['./lookup-create.component.scss']
})
export class LookupCreateComponent implements OnInit {
    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    dataTypes: Array<{ label: string; value: string }>;

    lookupForm: FormGroup;

    validatorsType: string;

    errorOnInit: any;
    responseOnSave: any;

    isSaving: boolean;
    saveIsPressed: boolean;
    cancelModalOpened: boolean;
    saveModalOpened: boolean;
    successModalOpened: boolean;
    isLookupDetail: boolean;
    lookupNameInvalid: boolean;

    lookupName: Lookup;

    constructor(private formBuilder: FormBuilder, private lookupService: LookupService) {
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

        this.lookupForm = formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.maxLength(250)]],
            dataType: [this.dataTypes[0].value, Validators.required],
            details: formBuilder.array([]),
            selectAllDetails: false
        });

        this.saveIsPressed = false;
        this.cancelModalOpened = false;
        this.saveModalOpened = false;
        this.successModalOpened = false;
        this.isLookupDetail = false;
        this.lookupNameInvalid = false;
    }

    get detailsForm(): FormArray {
        return <FormArray>this.lookupForm.get('details');
    }

    get lastdetailsForm(): FormGroup {
        return <FormGroup>this.detailsForm.get((this.detailsForm.controls.length - 1).toString());
    }

    ngOnInit() {
        this.detailsForm.disable();

        this.lookupForm
            .get('selectAllDetails')
            .valueChanges.subscribe(selectAll =>
            this.detailsForm.controls.forEach(detailsForm => detailsForm.get('selected').patchValue(selectAll))
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

        // this.lookupForm.get('name').valueChanges.subscribe(name => {
        //   this.lookupNameInvalid = false;
        // });

        this.lookupForm.get('name').valueChanges.subscribe(name => {
            this.lookupService.getLookup(name.toUpperCase().trim()).subscribe(lookupName => (this.lookupName = lookupName));
            this.lookupNameInvalid = false;
        });

        this.addChild();
    }

    private createDetailForm(): FormGroup {
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

        return this.formBuilder.group({
            selected: false,
            detailCode: ['', [Validators.required, Validators.maxLength(30)]],
            meaning: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(regex)]],
            description: ['', [Validators.required, Validators.maxLength(250)]],
            active: [true, Validators.required],
            dataType: [this.lookupForm.getRawValue().dataType, Validators.required]
        });
    }

    addChild(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }

        const detailForm: FormGroup = this.createDetailForm();

        this.detailsForm.push(detailForm);

        detailForm.get('selected').valueChanges.subscribe(() => {
            const allSelected: boolean = this.detailsForm
                .getRawValue()
                .map(form => form.selected)
                .reduce((prevVal, currVal) => prevVal && currVal);

            this.lookupForm.get('selectAllDetails').patchValue(allSelected, {emitEvent: false});
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

    disableRemoveSelected(): boolean {
        return this.detailsForm.getRawValue().filter(detail => detail.selected).length === 0;
    }

    removeSelected(evt: Event): void {
        evt.preventDefault();

        this.detailsForm
            .getRawValue()
            .map((detail, idx) => (detail.selected ? idx : -1))
            .filter(idx => idx > -1)
            .reverse()
            .forEach(idx => this.detailsForm.removeAt(idx));

        this.lookupForm.get('selectAllDetails').patchValue(false, {emitEvent: false});
    }

    invalidField(controlName: string | string[]): boolean {
        if (this.lookupForm.get(controlName).errors) {
            return (
                (this.lookupForm.get(controlName).errors.required && this.saveIsPressed) ||
                this.lookupForm.get(controlName).errors.maxlength ||
                this.lookupForm.get(controlName).errors.pattern
            );
        }

        return this.lookupForm.get(controlName).invalid && this.saveIsPressed;
    }

    checkFormValidity(evt: Event): void {
        evt.preventDefault();

        this.saveIsPressed = true;

        // this.lookupService.getLookup(this.lookupForm.getRawValue().name).subscribe(lookupName =>{
        //   this.lookupName = lookupName;
        //   this.lookupName.name === this.lookupForm.getRawValue().name ?
        //     this.lookupNameInvalid = true :  this.lookupNameInvalid =false;
        // });

        if (
            this.lookupName
                ? this.lookupName.name ===
                this.lookupForm
                    .getRawValue()
                    .name.toUpperCase()
                    .trim()
                : false
        ) {
            this.lookupNameInvalid = true;
        }

        if (this.showInvalidAlert() || this.detailsForm.length === 0 || this.lookupNameInvalid) {
            if (this.detailsForm.length === 0) {
                this.isLookupDetail = true;
            }
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else {
            this.isLookupDetail = false;
            this.openSaveModal();
        }
    }

    meaningDataType(idx: number): string {
        const formControl = this.lookupForm.get(['details', idx.toString(), 'meaning']);
        const requiredPattern =
            formControl && formControl.errors && formControl.errors.pattern && formControl.errors.pattern.requiredPattern;

        switch (requiredPattern) {
            case REGEX_NUMERIC.toString():
                return 'NUMERIC';

            case REGEX_TEXT.toString():
                return 'TEXT';

            case REGEX_DATE.toString():
                return 'DATE';

            default:
                return '';
        }
    }

    meaningIsText(idx: number): boolean {
        const formControl = this.lookupForm.get(['details', idx.toString(), 'meaning']);
        const errors = formControl && formControl.errors;

        return (errors.pattern && errors.pattern.requiredPattern) === REGEX_TEXT.toString();
    }

    meaningIsDate(idx: number): boolean {
        return this.lookupForm.get(['details', idx.toString(), 'meaning']).errors.requiredPattern === REGEX_DATE.toString();
    }

    showInvalidAlert(): boolean {
        return this.saveIsPressed && this.lookupForm.invalid;
    }

    openCancelModal(evt: Event): void {
        evt.preventDefault();
        this.cancelModalOpened = true;
    }

    private openSaveModal(): void {
        this.saveModalOpened = true;
    }

    save(): void {
        this.isSaving = true;

        const saveResponseAction: Function = response => {
            this.responseOnSave = response;
            this.isSaving = false;
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        };

        this.lookupService
            .postSave({
                ...this.lookupForm.value,
                name: this.lookupForm.getRawValue().name.toUpperCase(),
                details: this.lookupForm.value.details.map(child => {
                    const {selected, ...others} = child;
                    return others;
                })
            })
            .subscribe(
                success => {
                    saveResponseAction(success);
                    this.successModalOpened = true;
                },
                error => saveResponseAction(error)
            );
    }
}
