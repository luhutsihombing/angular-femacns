import { LookupService } from './../../../lookup/_service/lookup.service';
import * as $ from 'jquery';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ClrDatagridStateInterface } from '@clr/angular';
import { Branch } from '../_model/mapping-area.model';
import { MappingAreaService } from '../_service/mapping-area.service';
import {ActionResponse} from '../../../_model/app.model';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'fema-cms-mapping-area-create',
  templateUrl: './mapping-area-create.component.html',
  styleUrls: ['./mapping-area-create.component.scss'],
})

export class MappingAreaCreateComponent implements OnInit {
  @ViewChild('clrContentArea') clrContentArea: ElementRef;
  createMappringAreaForm: FormGroup;

  branch: Branch[];
  selectedBranches: Branch[];

  unSelectedBranch: Branch[];
  selectedBranch: Branch[];

  pageSize: number;

  pageFrom: number;
  pageTo: number;
  pageFromUnSelected: number;
  pageToUnSelected: number;

  uiState: {
    cancelModalOpened: boolean;
    formInvalid: boolean;
    saveIsPressed: boolean;
    saveModalOpened: boolean;
    successModalOpened: boolean;
  };

  responseOnSave: any;
  responseOnAction: ActionResponse;

  constructor(
    private formBuilder: FormBuilder,
    private mappingAreaSvc: MappingAreaService,
    private lookupSvc: LookupService
  ) {
    this.createMappringAreaForm = formBuilder.group({
      areaName: ['', Validators.required],
      unSelectedBranch: [],
      selectedBranch: [],
      cellName: ['']
    });

    this.branch = [];
    this.selectedBranches = [];

    this.pageSize = 0;
    this.uiState = {
      cancelModalOpened: false,
      formInvalid: false,
      saveIsPressed: false,
      saveModalOpened: false,
      successModalOpened: false,
    };
  }

  ngOnInit() {
    this.loadBranch();
    this.lookupSvc
    .getLookupDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS')
    .subscribe(pageSize => this.pageSize = <number>pageSize);
  }

  refresh(state: ClrDatagridStateInterface) {
    this.pageFrom = state.page.from;
    this.pageTo = state.page.to;
  }
  refreshSelectedBranches(state: ClrDatagridStateInterface) {
    this.pageFromUnSelected = state.page.from;
    this.pageToUnSelected = state.page.to;
  }

  loadBranch(evt?: Event): void {
    if (evt) {
      evt.preventDefault();
    }

    const searchBranch = {
      branchName: this.createMappringAreaForm.getRawValue().cellName
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

  private openSaveModal(): void {
    this.uiState.saveModalOpened = true;
  }

  showInvalidAlert(): boolean {
    return this.uiState.saveIsPressed && this.createMappringAreaForm.invalid;
  }

  invalidField(controlName: string | string[]): boolean {
    if (this.createMappringAreaForm.get(controlName).errors) {
      return this.createMappringAreaForm.get(controlName).errors.required && this.uiState.saveIsPressed;
    }

    return this.createMappringAreaForm.get(controlName).invalid && this.uiState.saveIsPressed;
  }

  checkFormValidity(evt: Event): void {
    evt.preventDefault();
    this.uiState.saveIsPressed = true;

    if (this.showInvalidAlert()) {
      this.uiState.formInvalid = true;
      $(this.clrContentArea.nativeElement).animate({ scrollTop: 0 }, 500, 'swing');
    } else {
      this.openSaveModal();
    }
  }

  save(): void {
    const saveTerm = {
      ...this.createMappringAreaForm.getRawValue(),
      areaName: this.createMappringAreaForm.getRawValue().areaName.toUpperCase(),
      branchCode: this.selectedBranches.map(branchs => branchs.branchCode)
    };

    this.responseOnAction = undefined;

    this.mappingAreaSvc
        .postAreaSave(saveTerm)
        .pipe(
            finalize(() => {
                this.uiState.saveIsPressed = false;
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
}
