import {Branch, MappingArea} from '../_model/mapping-area.model';
import {MappingAreaService} from '../_service/mapping-area.service';
import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {concatMap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-mapping-area-view',
    templateUrl: './mapping-area-view.component.html',
    styleUrls: ['./mapping-area-view.component.scss']
})
export class MappingAreaViewComponent implements OnInit {

    area: MappingArea;
    errorOnInit: any;

    branch: Branch[];

    constructor(
        private ar: ActivatedRoute,
        private location: Location,
        private mappingAreaSvc: MappingAreaService,
    ) {
        this.branch = [];
    }

    ngOnInit() {

        this.initViewEvent();
        this.area = {} as MappingArea;

    }

    initViewEvent(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
            this.errorOnInit = undefined;
        }

        this.ar.params
            .pipe(concatMap(params => this.mappingAreaSvc.getAreaId(params.id)))
            .subscribe(area => this.area = area, error => this.errorOnInit = error);

        const searchBranch = {
            branchName: ''
        };

        this.ar.params
            .pipe(concatMap(params => this.mappingAreaSvc.getBranchName(searchBranch)))
            .subscribe(branch => this.branch = branch, error => this.errorOnInit = error);

    }

    back(evt: Event): void {

        evt.preventDefault();
        this.location.back();

    }

}
