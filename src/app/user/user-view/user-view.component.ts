import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {User} from '../_model/user.model';
import {UserService} from '../_service/user.service';
import {concatMap} from 'rxjs/operators';

@Component({
    selector: 'fema-cms-user-view',
    templateUrl: './user-view.component.html',
    styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {
    error: any;
    user: User;

    constructor(private ar: ActivatedRoute, private location: Location, private userSvc: UserService) {
    }

    ngOnInit() {
        this.initViewUserDetails();

        this.user = {} as User;
    }

    initViewUserDetails(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
            this.error = undefined;
        }

        this.ar.params
            .pipe(concatMap(params => this.userSvc.getUserDetails(params.username)))
            .subscribe(user => (this.user = user), error => (this.error = error));
    }

    back(evt: Event): void {
        evt.preventDefault();
        this.location.back();
    }
}
