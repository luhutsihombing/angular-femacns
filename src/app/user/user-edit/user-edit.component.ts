import {LookupDetail} from '../../lookup/_model/lookup.model';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import * as $ from 'jquery';
import {ActivatedRoute} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {combineLatest} from 'rxjs';
import {ResponsibilitySearchItem} from '../../responsibility/_model/responsibility.model';
import {ResponsibilityService} from '../../responsibility/_service/responsibility.service';
import {Branch, Organization, Job} from '../_model/user.model';
import {UserService} from '../_service/user.service';
import {concatMap, debounceTime, tap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.scss'],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {dateInput: 'LL'},
                display: {
                    dateInput: 'DD-MMM-YYYY',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class UserEditComponent implements OnInit {
    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    editForm: FormGroup;
    searchRespForm: FormGroup;
    lastWebRespForm: FormGroup;
    lastMobileRespForm: FormGroup;

    peopleTypeMeaning: string;

    cmsRespSearchList: ResponsibilitySearchItem[];
    filteredCmsRespSearchList: ResponsibilitySearchItem[];
    femaRespSearchList: ResponsibilitySearchItem[];
    filteredFemaRespSearchList: ResponsibilitySearchItem[];
    errorOnInit: any;
    responseOnSave: any;
    date: Date;
    branchInvalid: boolean;
    orgInvalid: boolean;
    jobInvalid: boolean;
    branchList: Branch[];
    organizationList: Organization[];
    jobList: Job[];
    hcmsPeopleTypeLookupIDs: string[];
    saveIsPressed: boolean;
    isSaving: boolean;
    cancelModalOpened: boolean;
    saveModalOpened: boolean;
    successModalOpened: boolean;
    autocompMinChar: number;
    orgSuggestion: string[];
    jobSuggestion: string[];
    webInvalid: boolean;
    mobileInvalid: boolean;

    constructor(
        public activatedRoute: ActivatedRoute,
        public formBuilder: FormBuilder,
        public userService: UserService,
        public lookupService: LookupService,
        public responsibilityService: ResponsibilityService
    ) {
        this.editForm = formBuilder.group({
            active: [true, Validators.required],
            username: [{value: '', disabled: true}, [Validators.required, Validators.maxLength(50)]],
            fullName: ['', [Validators.required, Validators.maxLength(250)]],
            peopleTypeLookupId: [{value: '', disabled: true}, Validators.required],
            peopleTypeDescription: [{value: '', disabled: true}, Validators.required],
            birthDate: ['', Validators.required],
            email: ['', [Validators.required, Validators.maxLength(120), Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.maxLength(15), Validators.pattern('[+62]{3}[0-9]+')]],
            institution: ['', [Validators.required, Validators.maxLength(150)]],
            branchCode: ['', [Validators.required, Validators.maxLength(150)]],
            orgCode: ['', [Validators.required, Validators.maxLength(240)]],
            userResponsibilitiesMobile: formBuilder.array([]),
            userResponsibilitiesWeb: formBuilder.array([]),
            jobCode: ['', Validators.maxLength(240)],
            selectAllRespWeb: false,
            selectAllRespMob: false
        });

        this.peopleTypeMeaning = '';
        this.cmsRespSearchList = [];
        this.femaRespSearchList = [];

        this.hcmsPeopleTypeLookupIDs = [
            'PEOPLE_TYPE~CWK',
            'PEOPLE_TYPE~EMPLOYEE',
            'PEOPLE_TYPE~S',
            'PEOPLE_TYPE~INTERNSHIP'
        ];

        this.searchRespForm = formBuilder.group({
            name: '',
            peopleType: null
        });

        this.date = new Date();

        this.saveIsPressed = false;
        this.cancelModalOpened = false;
        this.saveModalOpened = false;
        this.successModalOpened = false;
    }

    get webRespForm(): FormArray {
        return <FormArray>this.editForm.get('userResponsibilitiesWeb');
    }

    // get lastWebRespForm(): FormGroup {
    //     return <FormGroup>this.webRespForm.get((this.webRespForm.length - 1).toString());
    // }

    get mobileRespForm(): FormArray {
        return <FormArray>this.editForm.get('userResponsibilitiesMobile');
    }

    // get lastMobileRespForm(): FormGroup {
    //     return <FormGroup>this.mobileRespForm.get((this.mobileRespForm.length - 1).toString());
    // }

    ngOnInit() {
        this.initEditForm();
        this.lookupService
            .getLookupDetailMeaning('GLOBAL_SETUP~MIN_CHAR')
            .subscribe(val => (this.autocompMinChar = <number>val));
        this.userService.getBranchHCMS().subscribe(branchList => (this.branchList = branchList));

        this.editForm.get('branchCode').valueChanges.subscribe(() => this.branchInvalid = false);
        this.editForm.get('orgCode').valueChanges.subscribe(() => this.orgInvalid = false);
        this.editForm.get('jobCode').valueChanges.subscribe(() => this.jobInvalid = false);

        this.editForm.get('selectAllRespWeb').valueChanges.subscribe(selectAll =>
            this.webRespForm.controls.forEach(webRespForm => {
                if (!webRespForm.get('selected').disabled) {
                    webRespForm.get('selected').patchValue(selectAll);
                }
            })
        );

        this.userService.getOrgzHCMS().subscribe(organizationList => {
            this.organizationList = organizationList.length === 0 ? this.organizationList : organizationList;
            this.orgSuggestion = organizationList.map(org => `${org.shortCode}~${org.nama}`);
        });

        this.userService.getJobHCMS().subscribe(jobList => {
            this.jobList = jobList.length === 0 ? this.jobList : jobList;
            this.jobSuggestion = jobList.map(job => `${job.kode}~${job.nama}`);
        });

        this.editForm.get('selectAllRespMob').valueChanges.subscribe(selectAll =>
            this.mobileRespForm.controls.forEach(mobileRespForm => {
                if (!mobileRespForm.get('selected').disabled) {
                    mobileRespForm.get('selected').patchValue(selectAll);
                }
            })
        );
    }

    initEditForm(): void {
        this.activatedRoute.params
            .pipe(
                concatMap(params =>
                    combineLatest(
                        this.lookupService.getPeopleTypes(),
                        this.responsibilityService.postResponsibilitySearchList(this.searchRespForm.value),
                        this.userService.getUserDetails(params.username),
                        (peopleTypes, respList, user) => ({peopleTypes, respList, user})
                    )
                )
            )
            .subscribe(values => {
                const userPeopleType: LookupDetail = values.peopleTypes.dataList.find(
                    peopleType => peopleType.id === values.user.peopleTypeLookupId
                );

                this.editForm.patchValue({
                    ...values.user,
                    peopleTypeDescription: userPeopleType.meaning,
                    peopleTypeLookupId: userPeopleType.id,
                    birthDate: values.user.birthDate ? new Date(values.user.birthDate).toISOString().split('T')[0] : ''
                });

                if (this.hcmsPeopleTypeLookupIDs.find(id => this.editForm.getRawValue().peopleTypeLookupId !== id)) {
                    this.editForm.get('email').enable();
                }

                if (!values.user.editable) {
                    this.editForm.get('fullName').disable();
                    this.editForm.get('birthDate').disable();
                    this.editForm.get('email').disable();
                    this.editForm.get('phoneNumber').disable();
                    this.editForm.get('institution').disable();
                    this.editForm.get('branchCode').disable();
                    this.editForm.get('orgCode').disable();
                    this.editForm.get('jobCode').disable();
                }

                values.user.responsibilitiesWeb.forEach((respWeb, idx) => {
                    this.webRespForm.push(this.createRespForm());

                    this.webRespForm.get([idx.toString(), 'name']).valueChanges.subscribe(name => {
                        const selectedResp: ResponsibilitySearchItem = this.cmsRespSearchList.find(resp => resp.name === name);

                        if (selectedResp) {
                            this.webRespForm.get([idx.toString(), 'id']).patchValue(selectedResp.id || '');
                        }
                    });

                    this.webRespForm.get(idx.toString()).patchValue({...respWeb});

                    if (!respWeb.editable) {
                        this.webRespForm.get(idx.toString()).disable();
                    }
                });

                this.filteredCmsRespSearchList = this.cmsRespSearchList
                    .map(
                        suggestion =>
                            this.webRespForm.getRawValue().find(resp => resp.name === suggestion.name) ? null : suggestion
                    )
                    .filter(suggestion => suggestion !== null);

                values.user.responsibilitiesMobile.forEach((respMobile, idx) => {
                    this.mobileRespForm.push(this.createRespForm());

                    this.mobileRespForm.get([idx.toString(), 'name']).valueChanges.subscribe(name => {
                        const selectedResp: ResponsibilitySearchItem = this.cmsRespSearchList.find(resp => resp.name === name);

                        if (selectedResp) {
                            this.mobileRespForm.get([idx.toString(), 'id']).patchValue(selectedResp.id || '');
                        }
                    });

                    this.mobileRespForm.get(idx.toString()).patchValue({...respMobile});

                    if (!respMobile.editable) {
                        this.mobileRespForm.get(idx.toString()).disable();
                    }
                });

                this.filteredFemaRespSearchList = this.femaRespSearchList
                    .map(
                        suggestion =>
                            this.mobileRespForm.getRawValue().find(resp => resp.name === suggestion.name) ? null : suggestion
                    )
                    .filter(suggestion => suggestion !== null);
            }, error => (this.errorOnInit = error));

        this.responsibilityService.postResponsibilitySearchList(this.searchRespForm.value).subscribe(respSearchList => {
            this.cmsRespSearchList = respSearchList.dataList.filter(resp => resp.accessType === 'WEB');
            this.filteredCmsRespSearchList = this.cmsRespSearchList;
            this.femaRespSearchList = respSearchList.dataList.filter(resp => resp.accessType === 'MOBILE');
            this.filteredFemaRespSearchList = this.femaRespSearchList;
        });
    }

    private createRespForm(): FormGroup {
        return this.formBuilder.group({
            selected: [false],
            id: [''],
            name: ['', Validators.maxLength(100)],
            note: ['', Validators.maxLength(250)]
        });
    }

    addCMSResp(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }

        const webRespForm: FormGroup = this.createRespForm();

        this.webRespForm.push(webRespForm);

        webRespForm.get('name').valueChanges
            .pipe(debounceTime(300))
            .subscribe(name => {
                if (name && name.length > 0 && name.length >= this.autocompMinChar) {
                    if (this.cmsRespSearchList) {
                        const respSuggestion: ResponsibilitySearchItem = this.cmsRespSearchList.find(resp => resp.name === name);

                        if (respSuggestion) {
                            respSuggestion && respSuggestion.note
                                ? webRespForm.patchValue({
                                    id: respSuggestion.id,
                                    name: respSuggestion.name,
                                    note: respSuggestion.note
                                    })
                                : webRespForm.patchValue({
                                    id: respSuggestion.id,
                                    name: respSuggestion.name
                                    });

                            this.filteredCmsRespSearchList = this.cmsRespSearchList
                                .map(
                                    suggestion =>
                                        this.webRespForm.getRawValue().find(resp => resp.name === suggestion.name) ? null : suggestion
                                )
                                .filter(suggestion => suggestion !== null);
                        }
                    }
                }
            });
    }

    checkCmsName(evt: Event, controlName: string[]) {
        evt.preventDefault();

        let isValidResp = true;

        const ctrlIdx: number = +controlName[1];

        const filteredVals = this.webRespForm
            .getRawValue()
            .map((resp, idx) => (idx !== ctrlIdx ? resp : null))
            .filter(resp => resp !== null);

        if (this.cmsRespSearchList) {
            isValidResp =
                this.cmsRespSearchList.findIndex(resp => resp.name === this.editForm.get(controlName).value) > -1 &&
                filteredVals.findIndex(resp => resp.name === this.editForm.get(controlName).value) === -1;
        }

        if (!isValidResp) {
            this.editForm.get(controlName).reset();
        }
    }

    removeSelectedCMSResp(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }

        this.webRespForm
            .getRawValue()
            .map((respForm, idx) => (respForm.selected ? idx : -1))
            .filter(idx => idx > -1)
            .reverse()
            .forEach(idx => this.webRespForm.removeAt(idx));

        this.editForm.get('selectAllRespWeb').patchValue(false, {emitEvent: false});
    }

    addFEMAResp(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }

        const mobileRespForm: FormGroup = this.createRespForm();

        this.mobileRespForm.push(mobileRespForm);

        mobileRespForm.get('name').valueChanges
            .pipe(debounceTime(300))
            .subscribe(name => {
                if (name && name.length > 0 && name.length >= this.autocompMinChar) {
                    if (this.femaRespSearchList) {
                        const respSuggestion: ResponsibilitySearchItem = this.femaRespSearchList.find(resp => resp.name === name);

                        if (respSuggestion) {
                            
                            respSuggestion && respSuggestion.note
                                ? mobileRespForm.patchValue({
                                    id: respSuggestion.id,
                                    name: respSuggestion.name,
                                    note: respSuggestion.note
                                    })
                                : mobileRespForm.patchValue({
                                    id: respSuggestion.id,
                                    name: respSuggestion.name
                                    });

                            this.filteredFemaRespSearchList = this.femaRespSearchList
                                .map(
                                    suggestion =>
                                        this.mobileRespForm.getRawValue().find(resp => resp.name === suggestion.name) ? null : suggestion
                                )
                                .filter(suggestion => suggestion !== null);
                        }
                    }
                }
            });
    }

    checkFemaName(evt: Event, controlName: string[]) {
        evt.preventDefault();

        let isValidResp = true;

        const ctrlIdx: number = +controlName[1];

        const filteredVals = this.mobileRespForm
            .getRawValue()
            .map((resp, idx) => (idx !== ctrlIdx ? resp : null))
            .filter(resp => resp !== null);

        if (this.femaRespSearchList) {
            isValidResp =
                this.femaRespSearchList.findIndex(resp => resp.name === this.editForm.get(controlName).value) > -1 &&
                filteredVals.findIndex(resp => resp.name === this.editForm.get(controlName).value) === -1;
        }

        if (!isValidResp) {
            this.editForm.get(controlName).reset();
        }
    }

    removeSelectedFEMAResp(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }

        this.mobileRespForm
            .getRawValue()
            .map((respForm, idx) => (respForm.selected ? idx : -1))
            .filter(idx => idx > -1)
            .reverse()
            .forEach(idx => this.mobileRespForm.removeAt(idx));

        this.editForm.get('selectAllRespMob').patchValue(false, {emitEvent: false});
    }

    showInvalidAlert(): boolean {
        return (
            (this.saveIsPressed && this.editForm.invalid) ||
            (this.editForm.get(['userResponsibilitiesWeb', '0']) === null &&
                this.editForm.get(['userResponsibilitiesMobile', '0']) === null)
        );
    }

    invalidField(controlName: string | string[]): boolean {
        if (this.editForm.get(controlName).errors) {
            return (
                (this.editForm.get(controlName).errors.required && this.saveIsPressed) ||
                this.editForm.get(controlName).errors.maxlength ||
                this.editForm.get(controlName).errors.email
            );
        }

        return this.editForm.get(controlName).invalid && this.saveIsPressed;
    }

    fieldRequired(controlName: string | string[]): boolean {
        if (this.editForm.get(controlName).errors) {
            return this.editForm.get(controlName).errors.required && this.saveIsPressed;
        }
    }

    openCancelModal(evt: Event): void {
        evt.preventDefault();
        this.cancelModalOpened = true;
    }

    private openSaveModal(): void {
        this.saveModalOpened = true;
    }

    checkOrgSuggestion(evt: Event, controlName: string | string[]) {
        evt.preventDefault();

        const organizationSuggestion: Organization = this.organizationList
            ? this.organizationList.find(org => `${org.shortCode}~${org.nama}` === this.editForm.get(controlName).value)
            : undefined;
        if (!organizationSuggestion) {
            this.orgInvalid = true;
        }
    }

    checkJobSuggestion(evt: Event, controlName: string[]) {
        evt.preventDefault();

        const jobSuggestion: Job = this.jobList
            ? this.jobList.find(jobs => `${jobs.kode}~${jobs.nama}` === this.editForm.get(controlName).value)
            : undefined;

        if (!jobSuggestion) {
            this.jobInvalid = true;
        }
    }

    checkBranchSuggestion(evt: Event, controlName: string | string[]) {
        evt.preventDefault();

        const branchSuggestion: Branch = this.branchList
            ? this.branchList.find(branch => `${branch.kode}~${branch.nama}` === this.editForm.get(controlName).value)
            : undefined;

        if (!branchSuggestion) {
            this.branchInvalid = true;
        }
    }

    checkFormValidity(evt: Event): void {
        evt.preventDefault();
        this.saveIsPressed = true;
        this.webInvalid = false;
        this.mobileInvalid = false;

        if (this.editForm.get(['userResponsibilitiesWeb', '0']) !== null) {
            for (length = 1;  length <= this.webRespForm.length; length++) {
                this.lastWebRespForm = <FormGroup>this.webRespForm.get((length - 1).toString());
                this.lastWebRespForm.get('name').setValidators(Validators.required);
                this.lastWebRespForm.get('name').updateValueAndValidity({onlySelf: true});
                if (this.lastWebRespForm.get('name').invalid) {
                    this.webInvalid = true;
                }
            }
        }
        if (this.editForm.get(['userResponsibilitiesMobile', '0']) !== null) {
            for (length = 1;  length <= this.mobileRespForm.length; length++) {
                this.lastMobileRespForm = <FormGroup>this.mobileRespForm.get((length - 1).toString());
                this.lastMobileRespForm.get('name').setValidators(Validators.required);
                this.lastMobileRespForm.get('name').updateValueAndValidity({onlySelf: true});
                if (this.lastMobileRespForm.get('name').invalid) {
                    this.mobileInvalid = true;
                }
            }
        }

        if (this.showInvalidAlert() || this.orgInvalid || this.jobInvalid || this.webInvalid || this.mobileInvalid) {
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else {
            this.openSaveModal();
        }
    }

    save(): void {

        this.isSaving = true;

        const userResponsibilitiesMobile = this.mobileRespForm
            .getRawValue()
            .map(({selected, ...respMobile}) => respMobile);

        const userResponsibilitiesWeb = this.webRespForm.getRawValue().map(({selected, ...respWeb}) => respWeb);

        this.userService
            .postUserSave({
                ...this.editForm.getRawValue(),
                userResponsibilitiesMobile,
                userResponsibilitiesWeb,
            })
            .pipe(tap(() => {

                this.isSaving = false;

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

            }))
            .subscribe(
                success => {
                    this.responseOnSave = success;
                    this.successModalOpened = true;
                },
                error => this.responseOnSave = error
            );

    }

}
