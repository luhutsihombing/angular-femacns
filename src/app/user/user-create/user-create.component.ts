import * as $ from 'jquery';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupDetail} from '../../lookup/_model/lookup.model';
import {LookupService} from '../../lookup/_service/lookup.service';
import {ResponsibilitySearchItem} from '../../responsibility/_model/responsibility.model';
import {ResponsibilityService} from '../../responsibility/_service/responsibility.service';
import {Branch, Organization, Job} from '../_model/user.model';
import {UserService} from '../_service/user.service';
import {MAT_DATE_FORMATS} from '@angular/material';
import {concatMap, debounceTime, tap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-user-create',
    templateUrl: './user-create.component.html',
    styleUrls: ['./user-create.component.scss'],
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
export class UserCreateComponent implements OnInit {
    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    createForm: FormGroup;
    searchRespForm: FormGroup;
    lastWebRespForm: FormGroup;
    lastMobileRespForm: FormGroup;

    cmsRespSearchList: ResponsibilitySearchItem[];
    filteredCmsRespSearchList: ResponsibilitySearchItem[];
    femaRespSearchList: ResponsibilitySearchItem[];
    filteredFemaRespSearchList: ResponsibilitySearchItem[];

    errorOnInit: any;
    responseOnSave: any;
    responseInvalid: any;
    date: Date;
    branchList: Branch[];
    organizationList: Organization[];
    branchSuggestion: string[];
    orgSuggestion: string[];
    jobSuggestion: string[];
    jobList: Job[];
    peopleTypes: LookupDetail[];

    branchInvalid: boolean;
    orgInvalid: boolean;
    jobInvalid: boolean;
    excludedPeopleTypeLookupIDs: string[];
    webInvalid: boolean;
    mobileInvalid: boolean;
    isSaving: boolean;
    saveIsPressed: boolean;
    cancelModalOpened: boolean;
    saveModalOpened: boolean;
    successModalOpened: boolean;
    invalid: boolean;

    currentDate: any;
    autocompMinChar: number;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private responsibilityService: ResponsibilityService,
        private lookupService: LookupService
    ) {
        this.createForm = formBuilder.group({
            active: [true, Validators.required],
            username: [{value: '', disabled: true}, [Validators.required, Validators.maxLength(50)]],
            fullName: ['', [Validators.required, Validators.maxLength(250)]],
            peopleTypeLookupId: ['', Validators.required],
            birthDate: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.maxLength(15), Validators.pattern('[+62]{3}[0-9]+')]],
            institution: ['', [Validators.required, Validators.maxLength(150)]],
            branchCode: ['', [Validators.required, Validators.maxLength(150)]],
            orgCode: ['', [Validators.required, Validators.maxLength(240)]],
            userResponsibilitiesMobile: formBuilder.array([]),
            userResponsibilitiesWeb: formBuilder.array([]),
            selectAllRespWeb: false,
            selectAllRespMob: false,
            jobCode: ['', Validators.maxLength(240)],
            generatedUsername: false
        });

        this.cmsRespSearchList = [];
        this.femaRespSearchList = [];

        this.excludedPeopleTypeLookupIDs = ['PEOPLE_TYPE~CWK', 'PEOPLE_TYPE~EMPLOYEE', 'PEOPLE_TYPE~S'];

        this.searchRespForm = formBuilder.group({
            name: '',
            peopleType: null
        });

        this.date = new Date();

        this.saveIsPressed = false;
        this.cancelModalOpened = false;
        this.saveModalOpened = false;
        this.successModalOpened = false;

        this.currentDate = new Date();
    }

    get webRespForm(): FormArray {
        return <FormArray>this.createForm.get('userResponsibilitiesWeb');
    }

    // get lastWebRespForm(): FormGroup {
    //     return <FormGroup>this.webRespForm.get((this.webRespForm.length - 1).toString());
    // }

    get mobileRespForm(): FormArray {
        return <FormArray>this.createForm.get('userResponsibilitiesMobile');
    }

    // get lastMobileRespForm(): FormGroup {
    //     return <FormGroup>this.mobileRespForm.get((this.mobileRespForm.length - 1).toString());
    // }

    ngOnInit() {
        this.initCreateRespForm();

        this.orgSuggestion = [] as string[];
        this.jobSuggestion = [] as string[];
        this.branchSuggestion = [] as string[];

        this.lookupService
            .getLookupDetailMeaning('GLOBAL_SETUP~MIN_CHAR')
            .subscribe(val => (this.autocompMinChar = <number>val));

        this.userService.getBranchHCMS().subscribe(branchList => {
            this.branchList = branchList.length === 0 ? this.branchList : branchList;
            this.branchSuggestion = branchList.map(branch => `${branch.kode}~${branch.nama}`);
        });

        this.createForm.get('branchCode').valueChanges.subscribe(() => (this.branchInvalid = false));
        this.createForm.get('orgCode').valueChanges.subscribe(() => (this.orgInvalid = false));
        this.createForm.get('jobCode').valueChanges.subscribe(() => (this.jobInvalid = false));

        this.createForm.get('peopleTypeLookupId').valueChanges
            .pipe(concatMap(peopleType => this.userService.generateUsername(peopleType)))
            .subscribe(username => {
                this.createForm.get('username').patchValue(username);
                this.createForm.get('generatedUsername').patchValue(true);
            }, error => (this.errorOnInit = error));

        this.userService.getOrgzHCMS().subscribe(organizationList => {
            this.organizationList = organizationList.length === 0 ? this.organizationList : organizationList;
            this.orgSuggestion = organizationList.map(org => `${org.shortCode}~${org.nama}`);
        });
        this.userService.getJobHCMS().subscribe(jobList => {
            this.jobList = jobList.length === 0 ? this.jobList : jobList;
            this.jobSuggestion = jobList.map(job => `${job.kode}~${job.nama}`);
        });

        this.createForm
            .get('selectAllRespWeb')
            .valueChanges.subscribe(selectAll =>
            this.webRespForm.controls.forEach(webRespForm => webRespForm.get('selected').patchValue(selectAll))
        );

        this.createForm
            .get('selectAllRespMob')
            .valueChanges.subscribe(selectAll =>
            this.mobileRespForm.controls.forEach(mobileRespForm => mobileRespForm.get('selected').patchValue(selectAll))
        );
    }

    private createRespForm(): FormGroup {
        return this.formBuilder.group({
            selected: false,
            id: [''],
            name: ['', [Validators.maxLength(100)]],
            note: ['', Validators.maxLength(250)]
        });
    }

    initCreateRespForm(): void {
        this.lookupService.getPeopleTypes().subscribe(peopleTypes => {
            this.peopleTypes = peopleTypes.dataList.filter(
                peopleType => !this.excludedPeopleTypeLookupIDs.find(id => id === peopleType.id)
            );

            this.createForm.get('peopleTypeLookupId').patchValue(this.peopleTypes[0].id);
        });

        this.responsibilityService.postResponsibilitySearchList(this.searchRespForm.getRawValue()).subscribe(resps => {
            this.cmsRespSearchList = resps.dataList.filter(resp => resp.accessType === 'WEB');
            this.filteredCmsRespSearchList = this.cmsRespSearchList;
            this.femaRespSearchList = resps.dataList.filter(resp => resp.accessType === 'MOBILE');
            this.filteredFemaRespSearchList = this.femaRespSearchList;
        }, error => (this.errorOnInit = error));
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
                            webRespForm.patchValue({
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
                this.cmsRespSearchList.findIndex(resp => resp.name === this.createForm.get(controlName).value) > -1 &&
                filteredVals.findIndex(resp => resp.name === this.createForm.get(controlName).value) === -1;
        }

        if (!isValidResp) {
            this.createForm.get(controlName).reset();
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

        this.createForm.get('selectAllRespWeb').patchValue(false, {emitEvent: false});
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
                            mobileRespForm.patchValue({
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
                this.femaRespSearchList.findIndex(resp => resp.name === this.createForm.get(controlName).value) > -1 &&
                filteredVals.findIndex(resp => resp.name === this.createForm.get(controlName).value) === -1;
        }

        if (!isValidResp) {
            this.createForm.get(controlName).reset();
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

        this.createForm.get('selectAllRespMob').patchValue(false, {emitEvent: false});
    }

    invalidField(controlName: string | string[]): boolean {
        if (this.createForm.get(controlName).errors) {
            return (
                (this.createForm.get(controlName).errors.required && this.saveIsPressed) ||
                (this.createForm.get(controlName).errors.email && this.saveIsPressed) ||
                this.createForm.get(controlName).errors.maxlength ||
                this.createForm.get(controlName).errors.pattern
            );
        }

        return this.createForm.get(controlName).invalid && this.saveIsPressed;
    }

    checkOrgSuggestion(evt: Event, controlName: string[]) {
        evt.preventDefault();

        const organizationSuggestion: Organization = this.organizationList
            ? this.organizationList.find(org => `${org.shortCode}~${org.nama}` === this.createForm.get(controlName).value)
            : undefined;

        if (!organizationSuggestion) {
            this.orgInvalid = true;
        }
    }

    checkJobSuggestion(evt: Event, controlName: string[]) {
        evt.preventDefault();

        const jobSuggestion: Job = this.jobList
            ? this.jobList.find(jobs => `${jobs.kode}~${jobs.nama}` === this.createForm.get(controlName).value)
            : undefined;

        if (!jobSuggestion) {
            this.jobInvalid = true;
        }
    }

    checkBranchSuggestion(evt: Event, controlName: string | string[]) {
        evt.preventDefault();

        const branchSuggestion: Branch = this.branchList
            ? this.branchList.find(branch => `${branch.kode}~${branch.nama}` === this.createForm.get(controlName).value)
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

        if (this.createForm.get(['userResponsibilitiesWeb', '0']) !== null) {
            for (length = 1;  length <= this.webRespForm.length; length++) {
                this.lastWebRespForm = <FormGroup>this.webRespForm.get((length - 1).toString());
                this.lastWebRespForm.get('name').setValidators(Validators.required);
                this.lastWebRespForm.get('name').updateValueAndValidity({onlySelf: true});
                if (this.lastWebRespForm.get('name').invalid) {
                    this.webInvalid = true;
                }    
            }
            
        }
        if (this.createForm.get(['userResponsibilitiesMobile', '0']) !== null) {
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

    showInvalidAlert(): boolean {
        return (
            (this.saveIsPressed && this.createForm.invalid) ||
            (this.createForm.get(['userResponsibilitiesWeb', '0']) === null &&
                this.createForm.get(['userResponsibilitiesMobile', '0']) === null)
        );
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

        const userResponsibilitiesWeb = this.webRespForm.getRawValue().map(({selected, ...respWeb}) => respWeb);

        const userResponsibilitiesMobile = this.mobileRespForm
            .getRawValue()
            .map(({selected, ...respMobile}) => respMobile);

        this.userService
            .postUserSave({
                ...this.createForm.getRawValue(),
                userResponsibilitiesWeb,
                userResponsibilitiesMobile
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
