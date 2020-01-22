import ImageResize from 'quill-image-resize-module';
import {
    AfterViewInit, ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {ApiResourceService} from '../_service/api-resource.service';
// import {ImageDrop} from 'quill-image-drop-module';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, first} from 'rxjs/operators';

declare var Quill;

@Component({
    selector: 'fema-cms-quill',
    templateUrl: './_quill.component.html',
    styleUrls: ['./_quill.component.scss']
})
export class QuillComponent implements AfterViewInit, OnChanges, OnInit {

    @ViewChild('domQuill') domQuill: ElementRef;

    quill: any;

    @Input() initialContent: string;
    initialContentSubject: Subject<string>;

    @Input() imgFolder: string;

    contentSbj: Subject<string>;
    @Output() content: EventEmitter<string>;

    @Input() enabled: boolean;
    enabledSubject: Subject<boolean>;

    constructor(
        private cdr: ChangeDetectorRef,
        private resourceSvc: ApiResourceService
    ) {

        // cdr.detach();

        this.contentSbj = new Subject<string>();
        this.contentSbj.next('');

        this.initialContentSubject = new Subject<string>();

        this.imgFolder = '';

        this.content = new EventEmitter<string>();

        this.enabledSubject = new Subject<boolean>();

    }

    ngOnChanges(changes: SimpleChanges) {

        this.enabledSubject.next(this.enabled);
        this.initialContentSubject.next(this.initialContent);

    }

    ngOnInit() {

        this.contentSbj
            .asObservable()
            .pipe(
                distinctUntilChanged(),
                debounceTime(500)
            )
            .subscribe(content => {
                this.content.emit(content);
                // this.cdr.detectChanges();
            });

    }

    ngAfterViewInit() {

        // Quill.register('modules/imageDrop', ImageDrop);
        Quill.register('modules/imageResize', ImageResize);

        this.quill = new Quill(this.domQuill.nativeElement, {
            modules: {
                toolbar: [
                    [{font: []}],
                    [{align: []}],

                    ['clean'], // remove formatting button

                    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
                    ['blockquote', 'code-block'],

                    [{header: 1}, {header: 2}], // custom button values
                    [{list: 'ordered'}, {list: 'bullet'}],
                    [{script: 'sub'}, {script: 'super'}], // superscript/subscript
                    [{indent: '-1'}, {indent: '+1'}], // outdent/indent
                    [{direction: 'rtl'}], // text direction

                    // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                    [{color: []}, {background: []}], // dropdown with defaults from theme
                    [{header: [1, 2, 3, 4, 5, 6, false]}],

                    ['image', 'link', 'video'], // link and image, video
                ],
                // imageDrop: false,
                imageResize: {}
            },
            theme: 'snow'
        });

        this.quill.getModule('toolbar').addHandler('image', () => this.selectLocalImage());

        this.quill.on('text-change', () =>
            this.contentSbj.next(this.domQuill.nativeElement.querySelector('.ql-editor').innerHTML)
        );

        this.enabledSubject
            .asObservable()
            .pipe(
                filter(enabled => typeof enabled === 'boolean'),
                distinctUntilChanged(),
            )
            .subscribe(enabled => this.quill.enable(enabled));

        this.initialContentSubject
            .asObservable()
            .pipe(
                filter(content => typeof content === 'string' && content.length > 0),
                distinctUntilChanged(),
                first(),
            )
            .subscribe(content => this.domQuill.nativeElement.querySelector('.ql-editor').innerHTML = content);

    }

    private selectLocalImage(): void {

        const input: ElementRef['nativeElement'] = document.createElement('input');

        input.setAttribute('type', 'file');
        input.click();

        input.onchange = () => {

            const imgFile: File = input.files.item(0);
            const fileIsImg: boolean = imgFile.type === 'image/png' || imgFile.type === 'image/jpeg';

            if (fileIsImg) {

                this.resourceSvc
                    .upload(this.imgFolder, imgFile)
                    .subscribe(
                        imgUrl => this.quill.insertEmbed(this.quill.getSelection().index, 'image', imgUrl)
                    );

            }
        };

    }

}
