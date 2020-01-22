import {STANDARD_NON_STRING_SELECTION, STANDARD_MONTHS_NUMBER_SELECTION} from '../../_const/standard.const';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TgpViewService} from './tgp-view.service';
import {ActivatedRoute} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Tgp} from './tgp-view.model';
import {filter, switchMap} from 'rxjs/operators';
import {ErrorResponse} from '../../_model/app.model';
import * as $ from 'jquery';
import {Location} from '@angular/common';

@Component({
    selector: 'fema-cms-tgp-view',
    templateUrl: './tgp-view.component.html',
    styleUrls: ['./tgp-view.component.scss'],
})
export class TgpViewComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    monthSelections: Array<{ value: number; label: string; }>;
    tgpForm: FormGroup;

    tgpDetailContent: Tgp['data']['uploadDetails'];

    errorOnInit: ErrorResponse;

    constructor(
        private ar: ActivatedRoute,
        private fb: FormBuilder,
        private loc: Location,
        private tgpViewSvc: TgpViewService,
    ) {

        this.monthSelections = STANDARD_NON_STRING_SELECTION.concat(STANDARD_MONTHS_NUMBER_SELECTION);

        this.tgpForm = fb.group({
            targetNational: {value: null, disabled: true},
            achievementNational: {value: null, disabled: true},
            year: {value: null, disabled: true},
            month: {value: '', disabled: true},
        });

    }

    ngOnInit() {

        this.initialSetup();

    }

    backToPreviousPage(evt: Event): void {

        evt.preventDefault();

        this.loc.back();

    }

    initialSetup(): void {

        this.ar.params
            .pipe(
                filter(qParams => qParams.hasOwnProperty('headerId')),
                switchMap(({headerId}) => this.tgpViewSvc.getTgp(headerId))
            )
            .subscribe(
                tgp => {

                    this.tgpForm.patchValue({
                        targetNational: tgp.data.target,
                        achievementNational: tgp.data.achievement,
                        year: tgp.data.year,
                        month: tgp.data.month,
                    });

                    this.tgpDetailContent = tgp.data.uploadDetails;

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );
    }

}
