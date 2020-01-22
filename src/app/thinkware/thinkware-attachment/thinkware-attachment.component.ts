import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl, ValidatorFn} from '@angular/forms';
import { HTMLInputEvent } from '../../_model/app.model';
import { FemaValidator } from '../../_validators/fema.validators';
import { Thinkware, Attachment } from '../_model/thinkware.model';
import { REGEX_FILE_NAME } from '../../_const/regex.const';
import { LookupService } from '../../lookup/_service/lookup.service';

@Component({
  selector: 'fema-cms-thinkware-attachment',
  templateUrl: './thinkware-attachment.component.html',
  styleUrls: ['./thinkware-attachment.component.scss']
})

export class ThinkwareAttachmentComponent implements OnInit {

  // variable untuk dikirim ke komponen lain
  @Input() categoryM;
  @Input() lookup;
  @Input() thinkw: Thinkware;
  @Input() uiState;

  // variable yang datanya diterima dari komponen lain
  @Output() attachmentEmitter: EventEmitter<FormGroup>;
  @Output() attachmentLebihEmitter: EventEmitter<any>;
  @Output() existAttachment: EventEmitter<any>;
  @Output() tipeEmitter: EventEmitter<any>;

  // FormGroup untuk
  attachment: FormGroup;
  attachments: FormArray;
  existAttachments: FormGroup;

  // array
  attachmentDataList: Array<Attachment>;
  jumlahFiles: number[];
  maxFileSizes: number[];
  mimeFile: string[];
  tipe: string[];

  arrayFormSum: number;
  attachmentIsReady: boolean;
  bigCounter: number; // angka terbesar dari attachment yang tersedia *digunakan untuk rename file baru
  folder: string; // nama folder di server

  constructor(
    private fb: FormBuilder,
    private validators: FemaValidator,
    private lookupSvc: LookupService) {

    this.bigCounter = 0;

    this.attachmentEmitter = new EventEmitter();
    this.existAttachment = new EventEmitter();
    this.tipeEmitter = new EventEmitter();
    this.attachmentLebihEmitter = new EventEmitter();
    this.attachmentIsReady = false;

    this.attachment = fb.group({});
    this.existAttachments = fb.group({});
    this.tipe = [];
    this.maxFileSizes = [];
    this.mimeFile = [];
    this.jumlahFiles = [];
    this.arrayFormSum = 0;

  }

  ngOnInit() {

    // generate file field dari lookup
    this.lookupSvc.getLookupDetailList('THINKWARE_ATTACHMENT')
      .subscribe((fullData) => {
        for (let index = 0; index < fullData.dataList.length; index++) {

          this.arrayFormSum = fullData.dataList.length;
          let jumlahFile;
          if (Number(fullData.dataList[index].meaning.split('@')[0])) {
            jumlahFile = fullData.dataList[index].meaning.split('@')[0];
          } else {
            jumlahFile = 100;
          }
          const maxFileSize = fullData.dataList[index].meaning.split('@')[1];
          const tipeFile = fullData.dataList[index].detailCode;
          const mime = fullData.dataList[index].description;

          // push array tipe
          this.tipe.push(tipeFile);
          this.maxFileSizes.push(parseInt(maxFileSize, 10));
          this.jumlahFiles.push(parseInt(jumlahFile, 10));
          this.mimeFile.push(mime);

          // emit tipe ke header
          this.tipeEmitter.emit(this.tipe);
          const attachmentForms = this.fb.array([]);
          for (let index1 = 0; index1 < parseInt(jumlahFile, 10); index1++) {
            if (index1 < 4 ) {
              attachmentForms.push(this.addAttachment(tipeFile, parseInt(maxFileSize, 10), mime));
            }
          }
          this.attachment.addControl('attachment' + this.toTitleCase(tipeFile), attachmentForms as FormArray);
        }
        this.attachmentIsReady = true;

        // mengisi objek file dan pathnya untuk dikirim ke header
        for (let index = 0; index < this.tipe.length; index++) {
          const existAttachmentForms = this.fb.array([]);
          const exist = this.fb.group({});
          existAttachmentForms.push(exist);
          this.existAttachments.addControl('existAttachment' + this.toTitleCase(this.tipe[index]), existAttachmentForms);
        }

        for (let index = 0; index < this.attachmentDataList.length; index++) {
          const tambah =  REGEX_FILE_NAME.exec(this.attachmentDataList[index].fullPath)[0];
          const split = this.attachmentDataList[index].fullPath.split('/');
          this.folder = split[split.length - 2];
          const full = this.attachmentDataList[index].fullPath;
          let checkType = this.attachmentDataList[index].type;

          const part1 = tambah.split('-');
          const part2 = part1[3].split('.');
          const fileNumber = parseInt(part2[0], 10);

          if (fileNumber > this.bigCounter) {
            this.bigCounter = fileNumber;
          }
          for (let indexx = 0; indexx < this.tipe.length; indexx++) {
            if (checkType.substring(0, this.tipe[indexx].length) === this.tipe[indexx]) {
              checkType = this.tipe[indexx];
            }
          }

          const arrayForm = this.existAttachments.get('existAttachment' + this.toTitleCase(checkType)) as FormArray;
          const exist = this.fb.group({
            fileName: [tambah],
            fullPath: [full]
          });
          if (arrayForm) {
            arrayForm.push(exist);
            this.existAttachments.get('existAttachment' + this.toTitleCase(checkType)).setValue(arrayForm.value);
          }
          // akhir exist attachment
        }

        // menghilangkan null
        for (let counter = 0; counter < this.tipe.length; counter++) {
          const array = this.existAttachments.get('existAttachment' + this.toTitleCase(this.tipe[counter])) as FormArray;
          array.removeAt(0);
          this.existAttachments.get('existAttachment' + this.toTitleCase(this.tipe[counter])).setValue(array.value);
        }
        // akhir menghilangkan null

        // menambah data jika existFile lebih besar dari lookup
        for (let index = 0; index < this.tipe.length; index++) {
          const attachmentForms = this.attachment.get('attachment' + this.toTitleCase(this.tipe[index])) as FormArray;
          const existAttachmentForms = this.existAttachments.get('existAttachment' + this.toTitleCase(this.tipe[index])) as FormArray;
          const selisih: number = existAttachmentForms.length - attachmentForms.length;
          if (selisih > 0) {
            for (let hai = 0; hai < selisih; hai++) {
              this.pushAttachment(this.tipe[index], this.maxFileSizes[index], this.mimeFile[index]);
            }
          }
        }

        this.attachment.enable(); // trigger emit attachment ke depan
      }, error => {
        this.attachmentIsReady = false;
        console.log('Terjadi Masalah pada saat memuat Max Attachment Reload');
      }
    );
    // akhir generate file field dari lookup

    // mengisi attachment berdasarkan data dari backend
    switch (this.categoryM) {
      case 'SS' :
        this.attachmentDataList = this.thinkw.detailSS.attachment;
      break;
      case 'QCC' :
        this.attachmentDataList = this.thinkw.detailQCC.attachment;
      break;
      case 'QCP' :
        this.attachmentDataList = this.thinkw.detailQCP.attachment;
      break;
      case 'II' :
        this.attachmentDataList = this.thinkw.detailII.attachment;
      break;
    }

    this.attachment.valueChanges
      .subscribe(() => {
        // naming attachment
        let nomor = this.bigCounter + 1;
        const codeProject = this.thinkw.codeProject;

        for (let index = 0; index < this.tipe.length; index++) {
          const attachmentForms = this.attachment.get('attachment' + this.toTitleCase(this.tipe[index])) as FormArray;
          if (attachmentForms) {
            for (let index1 = 0; index1 < attachmentForms.length; index1++) {
              const file = attachmentForms.at(index1).get('file').value;
              if (file !== null) {
                const ext = file.name.split('.');
                if (ext[ext.length - 1].substring(0, this.tipe[index].length).toLowerCase() === this.tipe[index].toLowerCase()) {
                  document.getElementById('ren' + this.toTitleCase(this.tipe[index]) +  index1).innerHTML =
                    ' ( Output file akan menjadi : <b> ' + codeProject + '-' + nomor + '.' + ext[ext.length - 1] + ' </b>)';
                  nomor++;
                } else {
                  document.getElementById('ren' + this.toTitleCase(this.tipe[index]) +  index1).innerHTML = '';
                }
              } else if (document.getElementById('ren' + this.toTitleCase(this.tipe[index]) +  index1)) {
                document.getElementById('ren' + this.toTitleCase(this.tipe[index]) +  index1).innerHTML = '';
              }
            }
          }
        }
        // akhir naming attachment

        // emit file yg akan diupload ke header
        this.attachmentEmitter.emit(this.attachment);

        // emit existFile yg ke header
        const exist = {
          resultAttachment: this.existAttachments,
          folder: this.folder,
          count: this.bigCounter
        };
        this.existAttachment.emit(exist);

        // cek attachment lebih besar dari jumlah maksimal
        const attachmentLebih = [];
        for (let index = 0; index < this.tipe.length; index++) {
          const arrayForm = this.attachment.get('attachment' + this.toTitleCase(this.tipe[index])) as FormArray;
          const arrayFormExist = this.existAttachments.get('existAttachment' + this.toTitleCase(this.tipe[index])) ?
                                 this.existAttachments.get('existAttachment' + this.toTitleCase(this.tipe[index])) as FormArray : [];
          let counter  = 0;
          for (let index1 = 0; index1 < arrayForm.length; index1++) {
            if (arrayForm.at(index1).get('file').value) {
              counter++;
            }
            if (arrayForm.at(index1).get('name').value) {
              counter--;
            }
          }
          const counterExist: number = counter + arrayFormExist.length;
          const forPush = {
            isLebih: counterExist > this.jumlahFiles[index],
            jenis: this.tipe[index]
          };
          attachmentLebih.push(forPush);
        }
        this.attachmentLebihEmitter.emit(attachmentLebih);
        // akhir cek attachment lebih besar dari jumlah maksimal
      }
    );

  }

  // ==================================== SEPUTAR ATTACHMENT ===============================

  addAttachment(tipeFile: string, maxFileSize: number, mimeFile: string) {
    const attachmentForm = this.fb.group({
      file: [null, [
        this.validatorFileType(tipeFile),
        this.validators.maxFileSize(maxFileSize + 1)]],
      type: [tipeFile],
      name: [''],
      fullPath: ['']
    });
    return attachmentForm;
  }

  deleteAttachment(i, tipe) {
    const arrayAttachment = this.attachment.get('attachment' + tipe) as FormArray;
    arrayAttachment.at(i).get('name').setValue(this.existAttachments.get('existAttachment' + tipe).value[i].fileName);
    this.existAttachments.get('existAttachment' + tipe).value[i] = null;

    this.attachment.disable(); // trigger emit
    this.attachment.enable(); // trigger emit
  }

  pushAttachment(tipeFile: string, maxFileSize: number, mimeFile: string) {
    const attachmentForms = this.attachment.get('attachment' + this.toTitleCase(tipeFile)) as FormArray;
    attachmentForms.push(this.addAttachment(tipeFile, maxFileSize, mimeFile));
    this.attachment.addControl('attachment' + this.toTitleCase(tipeFile), attachmentForms as FormArray);
  }

  selectAttachment(evt: HTMLInputEvent, i, tipe) {
    evt.preventDefault();
    const attachmentArray = this.attachment.get('attachment' + tipe) as FormArray;
    const fileName = this.attachment.get('attachment' + tipe).value[i].name;
    attachmentArray.at(i).get('file').setValue(evt.target.files.item(0));
    attachmentArray.at(i).get('name').setValue(fileName);
    this.attachment.get('attachment' + tipe).setValue(attachmentArray.value);

    if (evt.target.files.item(0) === null) {
      document.getElementById(tipe.toLowerCase() + i).innerHTML = 'Tidak ada file terpilih';
    } else {
      document.getElementById(tipe.toLowerCase() + i).innerHTML = evt.target.files.item(0).name;
    }
  }

  // ==================================== AKHIR SEPUTAR ATTACHMENT ===============================

  get attachmentIsOk () {
    return this.attachmentIsReady;
  }

  callFileChooser(idFileChooser: string ) {
    document.getElementById(idFileChooser).click();
  }

  formArray(tipeAttachment: string) {
    const arrayForm = this.attachment.get('attachment' + tipeAttachment).value as FormArray;
    return arrayForm.length;
  }

  invalidFieldAttachment(index, tipe, control: AbstractControl | string | string[], errorType?: string): boolean {
    const attachmentArray = this.attachment.get('attachment' + tipe) as FormArray;
    const ctrl: AbstractControl = control instanceof AbstractControl ? control : attachmentArray.at(index).get(control);
    if (errorType) {
      return ctrl.hasError(errorType) ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;
    }
    return ctrl.invalid && this.uiState.saveIsPressed && ctrl.value.size ? true : false;

  }

  checkValidFile(index, tipe, control) {
    const attachmentArray = this.attachment.get('attachment' + this.toTitleCase(tipe)) as FormArray;
    const input = attachmentArray.at(index).get(control).value ? attachmentArray.at(index).get(control).value.name.split('.') : null;
    if (attachmentArray.at(index).get(control).value) {
      const ext = input[input.length - 1];
      if (ext.substring(0, tipe.length).toLowerCase() === tipe.toLowerCase()) {
        return false;
      } else {
        return true && this.uiState.saveIsPressed;
      }
    } else {
      return false;
    }

  }

  validatorFileType(fileType: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {

      if (control.value === null) {
          return null;
      }
      const extSplit = control.value.name.split('.');
      const ext = extSplit[extSplit.length - 1];
      const fileIsValid: boolean = ext.substring(0, fileType.length).toLowerCase() === fileType.toLowerCase();

      return fileIsValid ? null : {
          'fileTypes': {
              actualFileTypes: control.value.type,
              fileTypes: fileType
          }
      };

  };

  }

  toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
  }

}
