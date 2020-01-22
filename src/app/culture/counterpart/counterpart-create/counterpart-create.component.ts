import * as $ from 'jquery';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import {CounterpartService} from '../_service/counterpart.service';
import {CellArea, CellAreaCounterpart} from '../_model/counterpart.model';
import {LookupService} from '../../../lookup/_service/lookup.service';
import {debounceTime, distinctUntilChanged, filter, finalize, map, skipUntil, switchMap} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../../_model/app.model';
import {combineLatest, Subject} from 'rxjs';

@Component({
    selector: 'fema-cms-counterpart-create',
    templateUrl: './counterpart-create.component.html',
    styleUrls: ['./counterpart-create.component.scss']
})
export class CounterpartCreateComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    checkboxSubject: Subject<Event>;
    counterpartForm: FormGroup;

    suggestion: {
        cellAreas: Array<CellAreaCounterpart>;
        employees: string[];
    };

    lookup: {
        minChar: number;
    };

    uiState: {
        areasValidate: boolean;
        cancelModalIsOpen: boolean;
        isSaving: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        successModalIsOpen: boolean;
    };

    errorOnAction: ErrorResponse;
    responseOnAction: ActionResponse;

    readonly ngForTracker: Function = (idx: number): number => idx;

    get counterpartNameDatalist(): string {
        return this.counterpartForm.get('counterpartName').value.length >= this.lookup.minChar ? 'employeeSuggestion' : '';
    }

    get branchCodeForm(): FormGroup {
        return <FormGroup>this.counterpartForm.get('branchCode');
    }

    get branchCodes(): string[] {

        return (<CellAreaCounterpart[]>Object.values(this.counterpartForm.get('branchCode').value))
            .flatMap(area => Object.values(area.cell))
            .filter(cell => cell.checked)
            .map(cell => cell.code);

    }

    private createBranchCode(cellAreaCounterpart: CellAreaCounterpart): FormGroup {

        const branchCode: FormGroup = this.fb.group({
            ...cellAreaCounterpart,
            cell: this.fb.group({})
        });

        branchCode.get('checked').valueChanges
            .pipe(skipUntil(this.checkboxSubject.asObservable()))
            .subscribe(value => {

                for (const cellControl of Object.values((<FormGroup>branchCode.get('cell')).controls)) {

                    if (cellControl.get('enabled').value && typeof value === 'boolean') {

                        cellControl.get('checked').patchValue(value, {emitEvent: false});

                    }

                }

            });

        return branchCode;

    }

    private createCell(cellArea: CellArea): FormGroup {

        const cellForm: FormGroup = this.fb.group(cellArea);

        cellForm.get('checked').valueChanges
            .pipe(skipUntil(this.checkboxSubject.asObservable()))
            .subscribe(() => {

                const cells: CellArea[] = cellForm.parent.getRawValue()
                    ? (<CellArea[]>Object.values(cellForm.parent.getRawValue())).filter(cell => cell.enabled === true)
                    : [];

                const checkedCells: CellArea[] = cells.filter(cell => cell.checked === true);

                if (cells.length > 0) {

                    if (checkedCells.length === cells.length) {
                        // Checked
                        cellForm.parent.parent.get('checked').patchValue(true, {emitEvent: false});

                    } else if (checkedCells.length === 0) {
                        // Unchecked
                        cellForm.parent.parent.get('checked').patchValue(false, {emitEvent: false});

                    } else if ((checkedCells.length > 0) && (checkedCells.length <= cells.length)) {

                        cellForm.parent.parent.get('checked').patchValue('Indeterminate', {emitEvent: false});

                    }

                }

            });

        return cellForm;

    }

    constructor(
        private fb: FormBuilder,
        private counterpartSvc: CounterpartService,
        private lookupSvc: LookupService
    ) {

        this.counterpartForm = fb.group({
            counterpartName: ['', Validators.required],
            branchCode: fb.group({}),
        });

        this.checkboxSubject = new Subject<Event>();

        this.lookup = {
            minChar: 2
        };

        this.suggestion = {
            cellAreas: [],
            employees: []
        };

        this.uiState = {
            areasValidate: false,
            cancelModalIsOpen: false,
            isSaving: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            successModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.counterpartForm.get('counterpartName').valueChanges
            .pipe(
                debounceTime(300),
                filter(counterpartName => counterpartName && counterpartName.length >= this.lookup.minChar),
                distinctUntilChanged(),
                switchMap(counterpartName => this.counterpartSvc.getEmployeeSuggestions(counterpartName)),
                map(employees => employees.map(employee => `${employee.username}~${employee.fullName}`))
            )
            .subscribe(employees => this.suggestion.employees = employees);

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.counterpartSvc.getCellAreas(),
        )
            .subscribe(([minChar, cellAreas]) => {

                this.lookup.minChar = minChar;
                this.suggestion.cellAreas = cellAreas;

                for (const cellArea of cellAreas) {

                    const branchCode: FormGroup = this.createBranchCode(cellArea);

                    cellArea.cell.forEach(cell =>
                        (<FormGroup>branchCode.get('cell')).addControl(cell.code, this.createCell(cell))
                    );

                    this.branchCodeForm.addControl(cellArea.code, branchCode);

                }

            });

    }

    save(): void {

        this.uiState.isSaving = true;

        const saveTerm = {
            ...this.counterpartForm.getRawValue(),
            counterpartNumber: this.counterpartForm.getRawValue().counterpartName.split('~')[0],
            counterpartName: this.counterpartForm.getRawValue().counterpartName.split('~')[1],
            branchCode: this.branchCodes
        };

        this.counterpartSvc.save(saveTerm)
            .pipe(
                finalize(() => {

                    this.uiState.isSaving = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                success => {

                    this.responseOnAction = success;
                    this.uiState.successModalIsOpen = true;

                },
                error => {

                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                }
            );

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.counterpartForm.get(control);

        const buttonIsPressed: boolean = this.uiState.saveIsPressed;

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && buttonIsPressed : false;

        }

        return ctrl.invalid && buttonIsPressed;

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState = {
            ...this.uiState,
            saveIsPressed: true,
            areasValidate: false
        };

        const noArea: boolean = this.branchCodes.length === 0;

        if (this.counterpartForm.invalid) {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                type: 'ErrorResponse',
                message: 'Please check marked field(s)'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else if (noArea) {

            this.uiState.areasValidate = true;

            this.responseOnAction = {
                ...{} as ErrorResponse,
                type: 'ErrorResponse',
                message: 'Area must be filled'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

        }

    }

    checkEmployeeSuggestion(evt: Event, controlName: string | string[]) {

        evt.preventDefault();

        let isValidResp = true;

        if (this.suggestion.employees) {

            isValidResp = this.suggestion.employees.findIndex(employee =>
                employee === this.counterpartForm.get(controlName).value
            ) > -1;

        }

        if (!isValidResp) {
            this.counterpartForm.get(controlName).patchValue('');
        }

    }

    openCancelModal(evt: Event): void {

        evt.preventDefault();

        this.uiState.cancelModalIsOpen = true;

    }

}
