import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QuillComponent } from './_quill.component';

@NgModule({
  imports: [CommonModule],
  declarations: [QuillComponent],
  exports: [QuillComponent]
})
export class QuillModule {}
