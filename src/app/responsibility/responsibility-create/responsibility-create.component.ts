import {combineLatest} from 'rxjs';
import * as $ from 'jquery';
import {ResponsibilityFunctions, ParentFunction, SingleFunction} from '../_model/responsibility.model';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {ResponsibilityService} from '../_service/responsibility.service';
import {Router} from '@angular/router';
import {distinctUntilChanged, finalize} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {ResponsibilityValidator} from '../_validator/responsibility.validators';
import {LookupDetail} from '../../lookup/_model/lookup.model';

@Component({
    selector: 'fema-cms-responsibility-create',
    templateUrl: './responsibility-create.component.html',
    styleUrls: ['./responsibility-create.component.scss']
})
export class ResponsibilityCreateComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    respForm: FormGroup;

    accessTypes: LookupDetail[];
    functions: ResponsibilityFunctions;
    peopleTypes: LookupDetail[];
    selectedFunctions: Array<SingleFunction | ParentFunction>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        isSaving: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        cancelModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
    };

    readonly isParentFunction = (func: any): func is ParentFunction => 'children' in func && !('functionName' in func);

    get initialSetupIsReady(): boolean {
        return !!this.accessTypes && !!this.functions && !!this.peopleTypes;
    }

    get functionForm(): FormGroup {
        return <FormGroup>this.respForm.get('functionIds');
    }

    set patchAllPeopleTypes(val: boolean) {
        this.peopleTypes.forEach(peopleType => peopleType.active = val);
    }

    private patchAllRespFunctions(val: boolean = false): void {

        this.selectedFunctions.forEach(func => {
            func.functionEnabled = val;

            if (this.isParentFunction(func)) {
                func.children.forEach(childFunc => childFunc.functionEnabled = val);
            }
        });

    }

    constructor(
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private respSvc: ResponsibilityService,
        respValidator: ResponsibilityValidator
    ) {

        this.respForm = fb.group({
            id: null,
            active: [true, Validators.required],
            accessType: ['', Validators.required],
            accessTypeDescription: [{value: '', disabled: true}],
            name: ['', [Validators.required, Validators.maxLength(100)], respValidator.uniqueName()],
            description: ['', Validators.maxLength(500)],
            functionIds: [[], Validators.required], // Empty func form group for dynamic modification
            defaultResp: [false, Validators.required],
            peopleTypeLookupIds: [{value: [], disabled: true}],
            manager: [{value: false, disabled: true}]
        });

        this.selectedFunctions = [];

        this.uiState = {
            isSaving: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            cancelModalIsOpen: false,
            saveSuccessModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.respForm.get('defaultResp').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(isDefaultResp => {

                if (isDefaultResp) {

                    this.respForm.get('peopleTypeLookupIds').setValidators(Validators.required);
                    this.respForm.get('peopleTypeLookupIds').enable();

                } else {

                    this.respForm.get('peopleTypeLookupIds').clearValidators();
                    this.respForm.get('peopleTypeLookupIds').disable();

                    this.deselectAllPeopleTypes();

                }
            });

        this.respForm.get('accessType').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(accessType => this.selectedFunctions = this.functions[accessType.meaning]);

        combineLatest(
            this.respForm.get('accessType').valueChanges,
            this.respForm.get('peopleTypeLookupIds').valueChanges
        )
            .subscribe(([accessType, peopleTypeLookupIds]) => {

                if (
                    accessType.meaning === 'MOBILE'
                    && (peopleTypeLookupIds.findIndex(id => id === 'PEOPLE_TYPE~EMPLOYEE') >= 0)
                ) {

                    this.respForm.get('manager').setValidators(Validators.required);
                    this.respForm.get('manager').enable();

                } else {

                    this.respForm.get('manager').patchValue(false);
                    this.respForm.get('manager').clearValidators();
                    this.respForm.get('manager').disable();

                }

            });

    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getAccessTypes(),
            this.lookupSvc.getPeopleTypes(),
            this.respSvc.getAllFunctions()
        )
            .subscribe(
                ([accessTypes, peopleTypes, functions]) => {

                    this.accessTypes = accessTypes.dataList;
                    this.peopleTypes = peopleTypes.dataList;
                    this.functions = functions;

                    this.respForm.get('accessType').patchValue(this.accessTypes[0]);

                    this.selectedFunctions = this.functions[this.respForm.get('accessType').value.meaning];

                    this.deselectAllPeopleTypes();

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        if (!this.invalidField(this.respForm)) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

        } else {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        }

    }

    deselectAllFunctions(evt: Event): void {

        evt.preventDefault();

        this.patchAllRespFunctions();

    }

    deselectAllPeopleTypes(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.patchAllPeopleTypes = false;

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.respForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }

    openCancelModal(evt: Event): void {

        evt.preventDefault();

        this.uiState.cancelModalIsOpen = true;

    }

    save(): void {

        this.uiState.isSaving = true;

        this.respSvc
            .postCreateResponsibility({
                ...this.respForm.getRawValue(),
                name: this.respForm.get('name').value.toUpperCase(),
                accessType: this.respForm.get('accessType').value.meaning,
                accessTypeDescription: this.respForm.get('accessType').value.detailCode
            })
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

    selectAllFunctions(evt: Event): void {

        evt.preventDefault();

        this.patchAllRespFunctions(true);

    }

    selectAllPeopleTypes(evt: Event): void {

        evt.preventDefault();

        this.patchAllPeopleTypes = true;

    }

    selectPeopleTypeLookupIds(lookupDetail: LookupDetail, active: boolean): void {

        lookupDetail.active = active;

        this.respForm.get('peopleTypeLookupIds').patchValue(
            this.peopleTypes.filter(func => func.active).map(func => func.id)
        );

    }

    selectFunctionIds(funcObj: SingleFunction | ParentFunction, active: boolean) {

        funcObj['functionEnabled'] = active;

        this.functionForm.patchValue(this.selectedFunctions
            .flatMap(func => func.hasOwnProperty('children') ? func['children'] : func)
            .filter(func => func.functionEnabled)
            .map(func => func.functionId));

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.respForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

}
