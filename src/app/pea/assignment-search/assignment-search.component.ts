import {SearchUtil} from '../../_util/search.util';
import {of} from 'rxjs';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {concatMap, tap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-assignment-search',
    templateUrl: './assignment-search.component.html',
    styleUrls: ['./assignment-search.component.scss'],
})
export class AssignmentSearchComponent implements OnInit {

    peaForm: FormGroup;

    assignmentData: any;

    currentDate: string;

    qParams: any;
    pageSize: number;

    endDateOpened: boolean;
    startDateOpened: boolean;
    searchIsPressed: boolean;
    isSearching: boolean;
    openWarningModal: boolean;

    constructor(
        private ar: ActivatedRoute,
        private formBuider: FormBuilder,
        private router: Router,
        private searchUtil: SearchUtil,
    ) {
        this.pageSize = 10;

        this.peaForm = formBuider.group({
            processDateFrom: '',
            processDateTo: '',
        });

        this.currentDate = new Date().toISOString().split('T')[0];
    }

    ngOnInit() {
        this.ar.queryParams
            .pipe(
                concatMap(qParams => {
                    this.searchIsPressed = false;
                    this.isSearching = true;

                    this.qParams = qParams && qParams.q ? JSON.parse(qParams.q) : undefined;

                    if (this.qParams) {
                        this.peaForm.patchValue(this.qParams);
                    }

                    return of({} as {});
                }),
                tap(() => this.isSearching = false)
            )
            .subscribe(assignmentData => this.assignmentData = assignmentData);
    }

    resetCalendar(formSelc: string): void {
        this.peaForm.get(formSelc).patchValue('');
    }

    checkSearchParams(evt: Event): void {
        evt.preventDefault();

        this.searchIsPressed = true;

        this.searchUtil.noSearchParams(this.peaForm.getRawValue())
            ? this.openWarningModal = true
            : this.searchByInput();
    }

    searchByInput(): void {

        if (this.searchIsPressed) {

            const term = {
                ...this.peaForm.getRawValue()
            };

            this.openWarningModal = false;

            this.router.navigate(['/assignment/search'], {
                queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
                queryParamsHandling: 'merge'
            }).then();

        }

    }

}
