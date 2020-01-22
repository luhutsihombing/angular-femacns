import { ChannelViewerSummaryItem } from './../_model/channel.model';
import {ChannelService} from '../_service/channel.service';
import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {switchMap} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {ChannelViewerSummary} from '../_model/channel.model';

@Component({
    selector: 'fema-cms-channel-view',
    templateUrl: './channel-view.component.html',
    styleUrls: ['./channel-view.component.scss']
})
export class ChannelViewComponent implements OnInit {

    viewForm: FormGroup;

    viewerSummary: ChannelViewerSummaryItem[];

    get fiftubesForm(): FormArray {
        return <FormArray>this.viewForm.get('fiftubes');
    }

    constructor(
        private activatedRoute: ActivatedRoute,
        private formBuilder: FormBuilder,
        private location: Location,
        private channelSvc: ChannelService
    ) {

        this.viewForm = formBuilder.group({
            channel: ['', [Validators.required, Validators.maxLength(150)]],
            description: [{value: '', disabled: true}, Validators.maxLength(250)],
            fiftubes: formBuilder.array([]),
            iconChannelPath: ['', Validators.required],
            id: null,
            uploadId: null,
            viewer: ['', Validators.required]
        });

        this.viewerSummary = [] as ChannelViewerSummaryItem[];

    }

    ngOnInit() {

        this.activatedRoute.params
            .pipe(
                switchMap(({id}) => combineLatest(
                    this.channelSvc.getChannel(id),
                    this.channelSvc.getExistingMember(id)
                ))
            )
            .subscribe(([channel, channelMemberSummaryItems]) => {
                this.viewForm.patchValue(channel);

                for (const fiftube of channel.fiftubes) {
                    this.fiftubesForm.push(this.formBuilder.group(fiftube));
                }

                this.viewerSummary = channelMemberSummaryItems;
            });

    }

    back(evt: Event): void {

        evt.preventDefault();
        this.location.back();

    }

}
