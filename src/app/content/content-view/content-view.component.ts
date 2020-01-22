import {DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Content, ContentReceiverSummaryItem} from '../_model/content.model';
import {ContentService} from '../_service/content.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {combineLatest} from 'rxjs';
import {Location} from '@angular/common';
import {filter, map, switchMap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-content-view',
    templateUrl: './content-view.component.html',
    styleUrls: ['./content-view.component.scss']
})
export class ContentViewComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    contentForm: FormGroup;

    content: Content;
    contentReceiverSummaryItems: ContentReceiverSummaryItem[];

    errorOnInit: any;

    isSaving: boolean;

    constructor(
        fb: FormBuilder,
        private ar: ActivatedRoute,
        private location: Location,
        private lookupService: LookupService,
        private contentService: ContentService,
        private datePipe: DatePipe
    ) {

        this.contentForm = fb.group({
            contentReceiverType: '',
            publishDate: '',
            title: '',
            viaEmail: false,
            viaPushNotification: false
        });

    }

    ngOnInit() {

        this.initialSetup();

    }

    initialSetup(): void {

        this.ar.params
            .pipe(
                filter(params => params.hasOwnProperty('id')),
                switchMap(({id}) =>
                    combineLatest(
                        this.lookupService.getNewsCategories(),
                        this.lookupService.getLinkMenu(),
                        this.contentService.getContent(id),
                        this.contentService.getExistingReceiver(id)
                    )
                ),
                map(([
                    newsCategories,
                    linkMenu, content, contentReceiverSummaryItems]) => ({
                    newsCategories,
                    linkMenu: linkMenu.dataList.map(data => ({
                        ...data,
                        detailCode: data.detailCode.replace(/_/g, ' ')
                    })),
                    content,
                    contentReceiverSummaryItems
                }))
            )
            .subscribe(
                ({
                    newsCategories,
                    linkMenu, content, contentReceiverSummaryItems}) => {

                    this.contentReceiverSummaryItems = contentReceiverSummaryItems;

                    const findLinkMenu = (contentType: string) =>
                        linkMenu.find(link => link.id === content[contentType].idLinkedMenu);

                    const newsCategory = content.hasOwnProperty('newsDto')
                                ? newsCategories.dataList.find(newsCat => newsCat.id === content.newsDto.idNewsCategory)
                                : null;

                    this.content = {
                        ...content,
                        bannerDto: content.hasOwnProperty('bannerDto') ? {
                            ...content.bannerDto,
                            idLinkedMenu: findLinkMenu('bannerDto') ? findLinkMenu('bannerDto').detailCode : '-',
                        } : null,
                        newsDto: content.hasOwnProperty('newsDto') ? {
                            ...content.newsDto
                            ,
                            idNewsCategory: newsCategory ? newsCategory.meaning : '-'
                        } : null,
                        popupDto: content.hasOwnProperty('popupDto') ? {
                            ...content.popupDto,
                            idLinkedMenu: findLinkMenu('popupDto') ? findLinkMenu('popupDto').detailCode : '-',
                        } : null,
                        publishDate: content.viaPushNotification
                            ? this.datePipe.transform(new Date(content.publishDate), 'dd-MMM-yyyy')
                            : '-'
                    };

                    this.contentForm.patchValue(this.content);

                },
                error => this.errorOnInit = error
            );
    }

    back(evt: Event): void {

        evt.preventDefault();
        this.location.back();

    }

}
