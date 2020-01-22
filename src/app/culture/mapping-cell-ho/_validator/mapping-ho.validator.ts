import {AbstractControl, AsyncValidatorFn} from '@angular/forms';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {API_HO_VALIDATE_CELL, API_HO_VALIDATE_ORGANIZATION, API_HO_VALIDATE_PEMBINA} from '../../../_const/api.const';
import {catchError, map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {FormGroup} from '@angular/forms/src/model';
import {MappingHO} from '../_model/mapping-cell-ho.model';

@Injectable()
export class MappingHOValidator {

    constructor(private http: HttpClient) {
    }

    uniqueCellName(): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{ [key: string]: any }> => {

            const controlValue: MappingHO = control.parent && control.parent.getRawValue();

            return this.http
                .post<{ isFound: boolean }>(API_HO_VALIDATE_CELL, controlValue)
                .pipe(
                    map(({isFound}) => isFound ? {'unique': {value: !isFound}} : null),
                    catchError(() => null)
                );

        };

    }

    uniquePembinaUtama(): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{ [key: string]: any }> => {

            const controlValue: MappingHO = control.parent && control.parent.getRawValue();

            return this.http
                .post<{ isFound: boolean }>(API_HO_VALIDATE_PEMBINA, controlValue)
                .pipe(
                    map(({isFound}) => isFound ? {'unique': {value: !isFound}} : null),
                    catchError(() => null)
                );

        };

    }

    uniqueOrganization(): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{ [key: string]: any }> => {

            const controlValue: MappingHO = control.root && (<FormGroup>control.root).getRawValue();

            return this.http
                .post<{ isFound: boolean, duplicate: string[] }>(API_HO_VALIDATE_ORGANIZATION, controlValue)
                .pipe(
                    map(({duplicate}) => duplicate.findIndex(org => org === control.value) > -1
                        ? {'unique': {value: false}}
                        : null
                    ),
                    catchError(() => null)
                );

        };

    }

}

