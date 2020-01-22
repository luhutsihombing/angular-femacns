import { AlertInvalidFormComponent } from './alert-invalid-form/alert-invalid-form.component';
import { AlertOnActionComponent } from './alert-on-action/alert-on-action.component';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { FileNamePipe } from './_pipe/file-name.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule} from '@angular/material';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material';
import { ModalCancelComponent } from './modal-cancel/modal-cancel.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { ModalSaveComponent } from './modal-save/modal-save.component';
import { ModalSearchComponent } from './modal-search/modal-search.component';
import { NavComponent } from './nav/nav.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SafeUrlPipe } from './_pipe/safe-url.pipe';
import { SlicePipe } from './_pipe/slice.pipe';

@NgModule({
    imports: [CommonModule,
        RouterModule,
        ClarityModule.forRoot(),
        MatMomentDateModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule
    ],
    declarations: [
        HeaderComponent,
        NavComponent,
        AlertOnActionComponent,
        AlertInvalidFormComponent,
        ModalCancelComponent,
        ModalSaveComponent,
        ModalSearchComponent,
        ModalDeleteComponent,
        FileNamePipe,
        SafeUrlPipe,
        SlicePipe
    ],
    exports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
        ClarityModule,
        MatMomentDateModule,
        MatDatepickerModule,
        HeaderComponent,
        NavComponent,
        AlertOnActionComponent,
        AlertInvalidFormComponent,
        ModalCancelComponent,
        ModalSaveComponent,
        ModalSearchComponent,
        ModalDeleteComponent,
        FileNamePipe,
        SafeUrlPipe,
        SlicePipe,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule
    ]
})
export class SharedModule { }
