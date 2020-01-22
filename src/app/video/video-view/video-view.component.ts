import {ActivatedRoute} from '@angular/router';
import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {VideoService} from '../_service/video.service';
import {Location} from '@angular/common';
import {concatMap, debounceTime} from 'rxjs/operators';
import {fromEvent} from 'rxjs/internal/observable/fromEvent';

@Component({
    selector: 'fema-cms-video-view',
    templateUrl: './video-view.component.html',
    styleUrls: ['./video-view.component.scss']
})
export class VideoViewComponent implements OnInit, AfterViewChecked {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    @ViewChild('domVideo') domVideo: ElementRef;

    viewForm: FormGroup;

    videoHeight: string;

    errorOnInit: any;

    videoIsLoaded: boolean;
    saveIsPressed: boolean;
    cancelModalOpened: boolean;
    isSaving: boolean;

    constructor(
        private activatedRoute: ActivatedRoute,
        formBuilder: FormBuilder,
        private location: Location,
        private videoSvc: VideoService
    ) {
        this.viewForm = formBuilder.group({
            category: '',
            description: '',
            duration: '',
            feedback: '',
            id: null,
            showOnHome: true,
            thumbnailUrl: '',
            title: '',
            uploadDate: '',
            url: '',
            viewable: true
        });
    }

    ngAfterViewChecked() {

        if (this.domVideo && this.domVideo.nativeElement) {

            setTimeout(() => {

                const calculateVideoResolution: Function = () =>
                    (this.videoHeight = `${this.domVideo.nativeElement.offsetWidth * 0.5625} px`);

                calculateVideoResolution();

                fromEvent(window, 'resize')
                    .pipe(debounceTime(500))
                    .subscribe(() => calculateVideoResolution());

            }, 100);

        }

    }

    ngOnInit() {
        this.initViewForm();
    }

    initViewForm(): void {

        this.activatedRoute.params
            .pipe(concatMap(params => this.videoSvc.getVideo(params.id)))
            .subscribe(video => {
                this.videoIsLoaded = true;

                this.videoSvc.getFeedbackName(video.id)
                    .subscribe(feedbackName => {
                        this.viewForm.patchValue({
                            feedback: feedbackName.data.toString()
                        });
                    });

                this.viewForm.patchValue({
                    ...video,
                    showOnHome: video.showOnHome ? 'Yes' : 'No',
                    viewable: video.viewable ? 'Yes' : 'No'
                });
            }, error => this.errorOnInit = error);

    }

    openCancelModal(evt: Event): void {
        evt.preventDefault();
        this.cancelModalOpened = true;
    }

    back(evt: Event): void {
        evt.preventDefault();
        this.location.back();
    }
}
