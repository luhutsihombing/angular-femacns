import { AuthInterceptor } from '../../auth/_interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavService } from '../_service/nav.service';
import { Component, OnInit } from '@angular/core';
import { SingleNav, ParentNav, NavigationList } from '../_model/nav.model';

@Component({
  selector: 'fema-cms-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    NavService
  ]
})
export class NavComponent implements OnInit {
  navList: NavigationList;

  constructor(private navSvc: NavService) {}

  ngOnInit() {
    this.navSvc.getNavigations().subscribe(navList => (this.navList = navList));
  }

  isSingleNav(nav: any): nav is SingleNav {
    return !('children' in nav);
  }

  isParentNav(nav: any): nav is ParentNav {
    return 'children' in nav;
  }
}
