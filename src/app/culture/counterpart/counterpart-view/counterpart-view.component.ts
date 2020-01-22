import {CounterpartService} from '../_service/counterpart.service';
import {ActivatedRoute} from '@angular/router';
import {OnInit, Component, ViewChild, ElementRef} from '@angular/core';
import {Counterpart} from '../_model/counterpart.model';
import {Location} from '@angular/common';
import {filter, first, switchMap} from 'rxjs/operators';
import {ErrorResponse} from '../../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-counterpart-view',
    templateUrl: './counterpart-view.component.html',
    styleUrls: ['./counterpart-view.component.scss']
})
export class CounterpartViewComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    counterpart: Counterpart;

    errorOnInit: ErrorResponse;

    constructor(
        private ar: ActivatedRoute,
        private loc: Location,
        private counterpartSvc: CounterpartService
    ) {
    }

    ngOnInit() {

        this.initialSetup();

    }

    initialSetup(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
            this.errorOnInit = undefined;
        }

        this.ar.params
            .pipe(
                first(),
                filter(params => params.hasOwnProperty('id')),
                switchMap(({id}) => this.counterpartSvc.getById(id))
            )
            .subscribe(
                counterpart => this.counterpart = counterpart,
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    back(evt: Event): void {

        evt.preventDefault();

        this.loc.back();

    }

}
