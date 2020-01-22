import {CellArea, CellAreaCounterpart} from '../_model/counterpart.model';
import {LookupService} from '../../../lookup/_service/lookup.service';
import {CounterpartService} from '../_service/counterpart.service';
import {FormBuilder, Validators, FormGroup, AbstractControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import * as $ from 'jquery';
import {debounceTime, distinctUntilChanged, filter, finalize, map, skipUntil, switchMap} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../../_model/app.model';
import {combineLatest, Subject} from 'rxjs';

@Component({
    selector: 'fema-cms-counterpart-edit',
    templateUrl: './counterpart-edit.component.html',
    styleUrls: ['./counterpart-edit.component.scss']
})
export class CounterpartEditComponent implements OnInit {

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
        deleteModalIsOpen: boolean;
        deleteSuccessModalIsOpen: boolean;
        isSaving: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
    };

    errorOnInit: ErrorResponse;
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
        private ar: ActivatedRoute,
        private fb: FormBuilder,
        private counterpartSvc: CounterpartService,
        private lookupSvc: LookupService
    ) {

        this.counterpartForm = fb.group({
            counterpartName: ['', Validators.required],
            branchCode: fb.group({}),
            id: ''
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
            deleteModalIsOpen: false,
            deleteSuccessModalIsOpen: false,
            isSaving: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
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

        this.ar.params
            .pipe(
                switchMap(({id}) => combineLatest(
                    this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
                    this.counterpartSvc.getCellAreas(),
                    this.counterpartSvc.getById(id))
                )
            )
            .subscribe(
                ([minChar, cellAreas, counterpart]) => {

                    this.lookup.minChar = minChar;
                    this.suggestion.cellAreas = counterpart.areaCell;

                    for (const cellArea of counterpart.areaCell) {

                        const branchCode: FormGroup = this.createBranchCode(cellArea);

                        cellArea.cell.forEach(cell =>
                            (<FormGroup>branchCode.get('cell')).addControl(cell.code, this.createCell(cell))
                        );

                        this.branchCodeForm.addControl(cellArea.code, branchCode);

                    }

                    this.counterpartForm.patchValue({
                        counterpartName: `${counterpart.counterpartNumber}~${counterpart.counterpartName}`,
                        id: counterpart.id
                    });

                    for (const areaCell of counterpart.areaCell) {

                        for (const cell of areaCell.cell) {

                            this.counterpartForm.get(['branchCode', areaCell.code, 'cell', cell.code, 'checked']).patchValue(cell.checked);

                        }

                        this.counterpartForm.get(['branchCode', areaCell.code, 'checked']).patchValue(areaCell.checked);

                    }

                },
                error => this.errorOnInit = error
            );

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

                    this.responseOnAction = {...success, type: 'GenericResponse'};
                    this.uiState.saveSuccessModalIsOpen = true;

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

    openDeleteModal(evt: Event): void {

        evt.preventDefault();
        this.uiState.deleteModalIsOpen = true;

    }

    delete(): void {

        this.counterpartSvc.delete(this.counterpartForm.get('id').value)
            .pipe(finalize(() => {

                this.uiState = {
                    ...this.uiState,
                    saveIsPressed: false,
                    isSaving: false
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

            }))
            .subscribe(
                success => {
                    this.responseOnAction = {...success, type: 'GenericResponse'};
                    this.uiState.deleteSuccessModalIsOpen = true;
                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

}
