import JSSoup from 'jssoup';
import {ApiResourceService} from '../../../_service/api-resource.service';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ImageResize} from 'quill-image-resize-module';
import {LookupDetail} from '../../../lookup/_model/lookup.model';
import {ResourcePath} from '../../_model/api-resource.model';
import {combineLatest} from 'rxjs';

interface QuillState {
    enabled: boolean;
}

@Component({
    selector: 'fema-cms-content-create-news',
    templateUrl: './content-create-news.component.html',
    styleUrls: ['./content-create-news.component.scss']
})
export class ContentCreateNewsComponent implements OnChanges {
    @Output() formEmitter: EventEmitter<FormGroup>;

    newsForm: FormGroup;

    quillState: QuillState;

    newsImageUrls: string[];

    @Input() newsCategories: LookupDetail[];
    @Input() resourcePath: ResourcePath;

    @Input() formDisabled: boolean;
    @Input() saveIsPressed: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private apiResourceService: ApiResourceService
    ) {
        this.newsForm = this.formBuilder.group({
            selected: [false, Validators.required],
            content: '',
            contentPath: '',
            id: null,
            idNewsCategory: {value: '', disabled: true},
            thumbPath: ''
        });

        this.quillState = {} as QuillState;

        this.newsImageUrls = [] as string[];

        this.formEmitter = new EventEmitter();

        this.newsForm.get('selected').valueChanges.subscribe(selected => {

            if (selected) {

                this.mandatoryFields(['content', 'idNewsCategory']);
                this.optionalFields(['thumbPath']);

            } else {

                this.disabledFields(['content', 'idNewsCategory', 'thumbPath']);

            }

        });

        combineLatest(this.newsForm.valueChanges, this.newsForm.statusChanges)
            .subscribe(() => this.formEmitter.emit(this.newsForm));

        this.newsForm.get('selected').valueChanges.subscribe(selected => this.quillState.enabled = selected);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.newsForm) {
            if (changes.formDisabled && changes.formDisabled.currentValue) {
                this.newsForm.get('selected').patchValue(false);
                this.newsForm.get('selected').disable();
            } else {
                this.newsForm.get('selected').enable();
            }

            if (changes.newsCategories && changes.newsCategories.currentValue) {
                this.newsForm.get('idNewsCategory').patchValue(changes.newsCategories.currentValue[0].id);
            }

            this.formEmitter.emit(this.newsForm);
        }
    }

    private mandatoryFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.newsForm.get(name).setValidators(Validators.required);
            this.newsForm.get(name).enable();
        });
    }

    private optionalFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.newsForm.get(name).clearValidators();
            this.newsForm.get(name).enable();
        });
    }

    private disabledFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.newsForm.get(name).clearValidators();
            this.newsForm.get(name).disable();
        });
    }

    invalidField(controlName: string | string[]): boolean {
        if (this.newsForm.get(controlName).errors) {
            return this.newsForm.get(controlName).errors.required && this.saveIsPressed;
        }

        return this.newsForm.get(controlName).invalid && this.saveIsPressed;
    }

    getContent(html: string): void {
        const firstImgSoup = new JSSoup(html).find('img');

        this.newsForm.patchValue({
            content: html,
            thumbPath: firstImgSoup ? firstImgSoup.attrs.src : '',
        });
    }
}
