import {AuthService} from '../_service/auth.service';
import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
    selector: 'fema-cms-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    nextURL: string;
    errorOnLogin: any;

    isLoggingIn: boolean;

    constructor(
        formBuilder: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService
    ) {
        this.loginForm = formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.isLoggingIn = false;
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(qParams => (this.nextURL = qParams.next));
    }

    doLogin(evt: Event): void {

        evt.preventDefault();

        this.errorOnLogin = undefined;
        this.isLoggingIn = true;

        this.authService.postLogin(this.loginForm.value).subscribe(
            () => this.router.navigate([this.nextURL ? this.nextURL : '/dashboard']),
            error => {
                this.errorOnLogin = error;
                this.isLoggingIn = false;
            }
        );

    }
}
