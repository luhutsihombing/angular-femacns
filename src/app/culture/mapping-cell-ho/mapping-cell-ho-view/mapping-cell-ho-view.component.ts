import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {MappingHOService} from '../_service/mapping-ho.service';
import {Location} from '@angular/common';
import {filter, first, switchMap} from 'rxjs/operators';
import {ErrorResponse} from '../../../_model/app.model';

@Component({
    selector: 'fema-cms-mapping-cell-ho-view',
    templateUrl: './mapping-cell-ho-view.component.html',
    styleUrls: ['./mapping-cell-ho-view.component.scss']
})
export class MappingCellHoViewComponent implements OnInit {

    mappingForm: FormGroup;

    errorOnInit: ErrorResponse;

    constructor(
        private ar: ActivatedRoute,
        public location: Location,
        private mappingHoSvc: MappingHOService,
        private fb: FormBuilder,
    ) {

        this.mappingForm = fb.group({
            cellId: [{value: '', disabled: true}],
            cellName: [{value: '', disabled: true}],
            pembinaUtama: [{value: '', disabled: true}],
            organizations: fb.array([]),
            selectAllOrganizations: [{value: false, disabled: true}]
        });

    }

    get organizationsForm(): FormArray {
        return <FormArray>this.mappingForm.get('organizations');
    }

    private createOrgForm(): FormGroup {

        return this.fb.group({
            selected: [{value: false, disabled: true}],
            orgCode: [{value: '', disabled: true}],
        });

    }

    ngOnInit() {

        this.initialSetup();

    }

    initialSetup(): void {

        this.ar.params
            .pipe(
                filter(params => params.hasOwnProperty('id')),
                first(),
                switchMap(({id}) => this.mappingHoSvc.getHOById(id)),
            )
            .subscribe(ho => {

                this.mappingForm.patchValue({
                    cellId: ho.cellId,
                    cellName: ho.cellName,
                    pembinaUtama: ho.pembinaUtama
                });

                ho.organizations.forEach(org => {

                    const orgForm = this.createOrgForm();

                    orgForm.patchValue({
                        ...org,
                        orgCode: `${org.orgCode}-${org.orgName}`
                    });

                    this.organizationsForm.push(orgForm);

                });

            });

    }

}
