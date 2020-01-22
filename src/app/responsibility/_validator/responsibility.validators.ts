import {AbstractControl, AsyncValidatorFn, ValidatorFn} from '@angular/forms';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {ResponsibilitySearchItem} from '../_model/responsibility.model';
import {PaginatedResponse} from '../../_model/app.model';
import {API_RESPONSIBILITY_POST_SEARCH} from '../../_const/api.const';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ResponsibilityValidator {

    constructor(private http: HttpClient) {
    }

    uniqueName(): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{ [key: string]: any }> => {

            return this.http
                .post<PaginatedResponse<ResponsibilitySearchItem>>(
                    API_RESPONSIBILITY_POST_SEARCH,
                    {name: control.value, peopleType: null}
                )
                .pipe(
                    map(response =>
                        response.dataList.findIndex(resp =>
                            resp.name.toUpperCase() === control.value.toUpperCase()
                        ) >= 0 ? {'unique': {value: false}} : null
                    )
                );

        };

    }

    requiredOne(): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } => {

            return this.http
                .post<PaginatedResponse<ResponsibilitySearchItem>>(
                    API_RESPONSIBILITY_POST_SEARCH,
                    {name: control.value, peopleType: null}
                )
                .pipe(
                    map(response =>
                        response.dataList.findIndex(resp =>
                            resp.name.toUpperCase() === control.value.toUpperCase()
                        ) >= 0 ? {'unique': {value: false}} : null
                    )
                );

        };

    }

}
