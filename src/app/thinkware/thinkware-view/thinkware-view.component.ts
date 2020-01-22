import {Thinkware} from '../_model/thinkware.model';
import {ThinkwareService} from '../_service/thinkware.service';
import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {concatMap} from 'rxjs/operators';
import { LookupService } from '../../lookup/_service/lookup.service';

@Component({
    selector: 'fema-cms-thinkware-view',
    templateUrl: './thinkware-view.component.html',
    styleUrls: ['./thinkware-view.component.scss']
})
export class ThinkwareViewComponent implements OnInit {

    IISubCategory = [];
    QCCSubCategory = [];
    QCPSubCategory = [];

    branchName: string; // string untuk nama branch di leaderBranch
    glCode: string;

    thinkw: Thinkware;

    uiState: {
        cancelModalIsOpen: boolean;
    };

    categoryList: any[] = [
        {value : '', label: '-- Please Select --'}
    ];

    error: any;

    departmentIsVisible: Boolean = false;

    constructor(
        private ar: ActivatedRoute,
        private location: Location,
        private lookupSvc: LookupService,
        private thinkwareService: ThinkwareService,
    ) {
        this.uiState = {
            cancelModalIsOpen: false
        };
    }

    ngOnInit() {

        this.ar.params
            .pipe(concatMap(params => this.thinkwareService.getThinkwareId(params.id)))
            .subscribe(thinkw => {this.thinkw = thinkw;
                const branch = [];
                if (thinkw.branch !== null) {
                    if (thinkw.branch === 'HEADOFFICE') {
                        this.departmentIsVisible = true;
                    }
                }
            branch.push(this.thinkw.branch);
            this.thinkwareService.getGlCode(branch).subscribe(glcode => {
                this.glCode =  glcode.glCode;
                this.branchName = glcode.branchName;
            });
            }, error => (this.error = error));

            this.lookupSvc.getLookupDetailList('THINKWARE_KATEGORI')
            .subscribe((fullData) => {
                for (let index = 0; index < fullData.dataList.length; index++) {
                    if (fullData.dataList[index].active) {
                        const category = {
                            value: fullData.dataList[index].meaning,
                            label: fullData.dataList[index].description
                        };
                        this.categoryList.push(category);
                    }
                }
            });

            this.lookupSvc.getLookupDetailList('THINKWARE_SUBKATEGORI')
            .subscribe((fullData) => {
                for (let index = 0; index < fullData.dataList.length; index++) {
                    const subCategory = {
                        value : fullData.dataList[index].meaning,
                        name : fullData.dataList[index].description
                    };
                    if (fullData.dataList[index].id.indexOf('_II_') >= 0) {
                        this.IISubCategory.push(subCategory);
                    } else if (fullData.dataList[index].id.indexOf('_QCP_') >= 0) {
                        this.QCPSubCategory.push(subCategory);
                    } else if (fullData.dataList[index].id.indexOf('_QCC_') >= 0) {
                        this.QCCSubCategory.push(subCategory);
                    }
                }
            }
        );
    }

    back(evt: Event): void {

        evt.preventDefault();

        window.history.back();
        // this.location.back();
    }
}
