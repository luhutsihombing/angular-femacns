import { LookupService } from './../../../lookup/_service/lookup.service';
import { ClrDatagridStateInterface } from '@clr/angular';
import {ActivatedRoute} from '@angular/router';
import {MappingAreaService} from '../_service/mapping-area.service';
import {Branch, MappingArea} from '../_model/mapping-area.model';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import * as $ from 'jquery';
import {concatMap, filter, finalize} from 'rxjs/operators';
import {ActionResponse} from '../../../_model/app.model';

@Component({
    selector: 'fema-cms-mapping-area-edit',
    templateUrl: './mapping-area-edit.component.html',
    styleUrls: ['./mapping-area-edit.component.scss']
})
export class MappingAreaEditComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    editMappingAreaForm: FormGroup;

    branch: Branch[];
    selectedBranches: Branch[];

    unSelectedBranch: Branch[];
    selectedBranch: Branch[];


    area: MappingArea;

    responseOnSave: any;
    responseOnDelete: any;

    pageFrom: number;
    pageTo: number;
    pageFromUnSelected: number;
    pageToUnSelected: number;
    pageSize: number;

    responseOnAction: ActionResponse;

    uiState: {
        isSaving: boolean;
        cancelModalOpened: boolean;
        formInvalid: boolean;
        saveIsPressed: boolean;
        saveModalOpened: boolean;
        successModalOpened: boolean;
        deleteModalOpened: boolean;
        successModalDelete: boolean;
        isSearching: boolean;
    };

    constructor(
        private formBuilder: FormBuilder,
        private mappingAreaSvc: MappingAreaService,
        private ar: ActivatedRoute,
        private lookupSvc: LookupService
    ) {
        this.editMappingAreaForm = formBuilder.group({
            id: [''],
            areaName: ['', Validators.required],
            selectedBranch: [],
            unSelectedBranch: [],
            cellName: ['']
        });

        this.branch = [];
        this.selectedBranches = [];
        this.pageSize = 0;

        this.uiState = {
            isSaving: false,
            cancelModalOpened: false,
            formInvalid: false,
            saveIsPressed: false,
            saveModalOpened: false,
            successModalOpened: false,
            deleteModalOpened: false,
            successModalDelete: false,
            isSearching: false
        };

    }

    ngOnInit() {
        this.lookupSvc.
        getLookupDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS')
        .subscribe(pageSize => this.pageSize = <number>pageSize);

        this.ar.params
            .pipe(concatMap(params => this.mappingAreaSvc.getAreaId(params.id)))
            .subscribe(area => {
                this.area = area;
                this.selectedBranches = area.data.branches;

                this.selectedBranches
                .map(selectBranc => (selectBranc.active = false));

                this.editMappingAreaForm.patchValue({
                    ...area.data,
                    areaName: area.data.areaName
                });
            });
        this.loadBranch();

    }

    refresh(state: ClrDatagridStateInterface) {
        this.pageFrom = state.page.from;
        this.pageTo = state.page.to;
      }
      refreshSelectedBranches(state: ClrDatagridStateInterface) {
        this.pageFromUnSelected = state.page.from;
        this.pageToUnSelected = state.page.to;
      }

    searchcellName(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }

        const searchBranch = {
            areaId: this.area.data.id,
            branchName: this.editMappingAreaForm.getRawValue().cellName
          };

            this.mappingAreaSvc.getBranchNameEdit(searchBranch).subscribe(branchSearch => {

              this.branch = branchSearch.filter(
                array_el => this.selectedBranches.filter(anotherOne_el => anotherOne_el.branchName === array_el.branchName).length === 0
              );

            });
        const name = this.editMappingAreaForm.getRawValue().cellName;

      this.branch.filter(brc => (brc.branchName.includes(name)));
    }

    loadBranch(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }

        const searchBranch = {
            branchName: this.editMappingAreaForm.getRawValue().cellName
          };

            this.mappingAreaSvc.getBranchName(searchBranch).subscribe(branchSearch => {

              this.branch = branchSearch.filter(
                array_el => this.selectedBranches.filter(anotherOne_el => anotherOne_el.branchName === array_el.branchName).length === 0
              );

            });
    }


    addAll(evt: Event): void {
        const branches: Branch[] = [];
        for (let i = this.pageFrom; i <= this.pageTo; i++) {
          if (this.branch[i] != null && this.branch[i] !== undefined) {
            branches.push(this.branch[i]);
          }
        }
        this.selectedBranches = this.selectedBranches.concat(branches);
        this.selectedBranches.map(selectedBrc => (selectedBrc.active = false));
        this.branch = this.branch.filter(func => func.active);
        }

    add(evt: Event): void {
        evt.preventDefault();
        const selBranch = this.selectedBranch;
        if (selBranch !== [] && selBranch !== undefined && selBranch != null) {
          this.selectedBranches = this.selectedBranches.concat(selBranch);
          this.selectedBranches.map(selectedBrc => (selectedBrc.active = false));
          this.branch = this.branch.filter(func => func.active);
          this.selectedBranch = [];
        }
        }

    removeAll(evt: Event): void {
        const unBranches: Branch[] = [];
        for (let i = this.pageFromUnSelected; i <= this.pageToUnSelected; i++) {
          if (this.selectedBranches[i] != null && this.selectedBranches[i] !== undefined) {
            unBranches.push(this.selectedBranches[i]);
          }
        }
        this.branch = this.branch.concat(unBranches);
        this.branch.map(unSelect => (unSelect.active = true));
        this.selectedBranches = this.selectedBranches.filter(func => !func.active);
        }

    remove(evt: Event): void {
        evt.preventDefault();

        const unSelBranch = this.unSelectedBranch;
        if (unSelBranch !== [] && unSelBranch !== undefined && unSelBranch != null) {
          this.branch = this.branch.concat(unSelBranch);
          this.branch.map(unSelect => (unSelect.active = true));
          this.selectedBranches = this.selectedBranches.filter(func => !func.active);
          this.unSelectedBranch = [];
        }
        }

    openCancelModal(evt: Event): void {
        evt.preventDefault();
        this.uiState.cancelModalOpened = true;
    }

    openDeleteModal(evt: Event): void {
        evt.preventDefault();

        this.uiState.deleteModalOpened = true;
    }


    private openSaveModal(): void {
        this.uiState.saveModalOpened = true;
    }

    showInvalidAlert(): boolean {
        return this.uiState.saveIsPressed && this.editMappingAreaForm.invalid;
    }

    invalidField(controlName: string | string[]): boolean {
        if (this.editMappingAreaForm.get(controlName).errors) {
            return this.editMappingAreaForm.get(controlName).errors.required && this.uiState.saveIsPressed;
        }

        return this.editMappingAreaForm.get(controlName).invalid && this.uiState.saveIsPressed;
    }

    checkFormValidity(evt: Event): void {
        evt.preventDefault();
        this.uiState.saveIsPressed = true;

        if (this.showInvalidAlert()) {
            this.uiState.formInvalid = true;
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else {
            this.openSaveModal();
        }
    }

    save(): void {
        const saveTerm = {
            ...this.editMappingAreaForm.getRawValue(),
            areaName: this.editMappingAreaForm.getRawValue().areaName.toUpperCase(),
            branchCode: this.selectedBranches.map(branchs => branchs.branchCode)
        };


        this.mappingAreaSvc
            .postAreaSave(saveTerm)
            .pipe(
                finalize(() => {
                    this.uiState.saveIsPressed = false;
                    this.uiState.isSaving = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                })
            )
            .subscribe(
                success => {

                    this.responseOnAction = success;
                    this.uiState.successModalOpened = true;

                },
                error => {

                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                }
            );

    }

    delete(): void {

        this.mappingAreaSvc
            .deleteArea(this.editMappingAreaForm.getRawValue().id)
            .pipe(finalize(() => {

                this.uiState.saveIsPressed = false;
                this.uiState.isSaving = false;
                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

            }))
            .subscribe(
                success => {
                    this.responseOnAction = {...success, type: 'GenericResponse'};
                    this.uiState.successModalDelete = true;
                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }
}
