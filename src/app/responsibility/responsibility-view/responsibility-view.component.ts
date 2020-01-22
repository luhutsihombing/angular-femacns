import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Responsibility} from '../_model/responsibility.model';
import {ResponsibilityService} from '../_service/responsibility.service';
import {Location} from '@angular/common';
import {concatMap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-responsibility-view',
    templateUrl: './responsibility-view.component.html',
    styleUrls: ['./responsibility-view.component.scss']
})
export class ResponsibilityViewComponent implements OnInit {

    resp: Responsibility;
    errorOnInit: any;

    constructor(
        private ar: ActivatedRoute,
        private location: Location,
        private respSvc: ResponsibilityService
    ) {
    }

    ngOnInit() {

        this.ar.params
            .pipe(concatMap(params => this.respSvc.getResponsibility(params.id)))
            .subscribe(resp => (this.resp = resp), error => (this.errorOnInit = error));

    }

    back(evt: Event): void {

        evt.preventDefault();

        this.location.back();

    }
}
