import { FormGroup, FormBuilder } from '@angular/forms';
import { ContentNews } from '../../_model/content.model';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'fema-cms-content-view-news',
  templateUrl: './content-view-news.component.html',
  styleUrls: ['./content-view-news.component.scss']
})
export class ContentViewNewsComponent implements OnChanges {
  newsForm: FormGroup;
  @Input() news: ContentNews;

  constructor(formBuilder: FormBuilder) {
    this.newsForm = formBuilder.group({ contentPath: '', idNewsCategory: '' });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.news && changes.news.currentValue) {
      this.newsForm.patchValue(changes.news.currentValue);
    }
  }
}
