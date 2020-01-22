import {ReportService} from '../../report/_service/report.service';
import {SearchUtil} from '../../_util/search.util';
import {ActivatedRoute, Router} from '@angular/router';
import {LookupDetail, LookupSearchTerm} from '../_model/lookup.model';
import {LookupService} from '../_service/lookup.service';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Component, OnInit, AfterViewChecked, ChangeDetectorRef, ElementRef} from '@angular/core';
import {of} from 'rxjs';
import {concatMap, tap} from 'rxjs/operators';
import {PaginatedResponse} from '../../_model/app.model';
import {ReportType} from '../../report/_const/report-type.const';

@Component({
    selector: 'fema-cms-lookup-search',
    templateUrl: './lookup-search.component.html',
    styleUrls: ['./lookup-search.component.scss']
})
export class LookupSearchComponent implements OnInit, AfterViewChecked {

    lookupForm: FormGroup;

    lookupList: PaginatedResponse<LookupDetail>;

    responseOnSearch: any;

    openSearchModal: boolean;
    searchIsPressed: boolean;
    isSearching: boolean;

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        formBuilder: FormBuilder,
        private router: Router,
        private lookupService: LookupService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService
    ) {

        this.lookupForm = formBuilder.group({
            name: '',
            description: ''
        });

        this.lookupList = {} as PaginatedResponse<LookupDetail>;

    }

    ngOnInit() {

        this.ar.queryParams
            .pipe(
                concatMap(qParams => {
                    if (qParams.q) {
                        const term: LookupSearchTerm = JSON.parse(qParams.q);
                        this.lookupForm.patchValue(term);
                        return this.lookupService.postSearch(term);
                    }

                    return of({} as PaginatedResponse<LookupDetail>);
                }),
                tap(() => {

                    this.isSearching = false;
                    this.openSearchModal = false;

                })
            )
            .subscribe(
                lookupList => this.lookupList = lookupList,
                error => this.responseOnSearch = error
            );

    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    checkSearchParams(evt: Event): void {
        evt.preventDefault();

        this.searchIsPressed = true;

        this.searchUtil.noSearchParams(this.lookupForm.getRawValue())
            ? this.openSearchModal = true
            : this.searchByInput();
    }

    searchByInput(): void {

        if (this.searchIsPressed) {

            let term: LookupSearchTerm;

            if (this.lookupForm.getRawValue().name || this.lookupForm.getRawValue().description) {

                term = {
                    ...({} as LookupSearchTerm),
                    ...this.lookupForm.getRawValue()
                };

            } else if (!(this.lookupForm.getRawValue().name && this.lookupForm.getRawValue().description)) {

                term = {
                    ...({} as LookupSearchTerm),
                    ...this.lookupForm.getRawValue()
                };

            }

            this.openSearchModal = false;

            this.router.navigate(['/lookup/search'], {
                queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
                queryParamsHandling: 'merge'
            }).then();

        }

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.reportSvc.getDownloadUrl(ReportType.LOOKUP_SEARCH, this.lookupForm.getRawValue())
            .subscribe(reportUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.style = 'display: none';
                aEle.download = `FEMA-LOOKUP-SEARCH-(${new Date().getTime()}).xlsx`;
                aEle.href = reportUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }

}
