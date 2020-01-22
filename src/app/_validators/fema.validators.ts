import {AbstractControl, AsyncValidatorFn, ValidatorFn} from '@angular/forms';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class FemaValidator {

    constructor(private http: HttpClient) {
    }

    unique(validatorApiUrl: string, idSelector: string = null): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{ [key: string]: any }> => {

            const id: string = control.parent && idSelector ? control.parent.get(idSelector).value : idSelector;
            const title: string = control.value;

            return this.http
                .post<{ isFound: boolean }>(validatorApiUrl, {id, title})
                .pipe(map(response => response.isFound ? {'unique': {value: !response.isFound}} : null));

        };

    }

    uniqueFeedback(validatorApiUrl: string, idSelector: string = null): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{ [key: string]: any }> => {

            const feedbackId: string = control.parent && idSelector ? control.parent.get(idSelector).value : idSelector;
            const templateName: string = control.value;

            return this.http
                .post<{ isFound: boolean }>(validatorApiUrl, {feedbackId, templateName})
                .pipe(map(response => response.isFound ? {'unique': {value: !response.isFound}} : null));

        };

    }

    fileTypes(mimeTypes: string[]): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } => {

            if (control.value === null) {
                return null;
            }

            const fileIsValid: boolean = mimeTypes.includes(control.value && control.value.type)
                && control.value.name.split('.')[1] !== 'csv';

            return fileIsValid ? null : {
                'fileTypes': {
                    actualFileTypes: control.value.type,
                    fileTypes: mimeTypes.toString()
                }
            };

        };

    }

    maxFileSize(maxSizeInMB: number): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } => {

            if (control.value === null) {
                return null;
            }

            return control.value && (control.value.size >= maxSizeInMB * 1024)
                // jika maxSizeInMB > size maka akan keluar keluar pemberitahuan
                ? {
                    'maxFileSize': {
                        actualFileSize: `${control.value.size * 1024}`,
                        maxFileSize: `${maxSizeInMB}`
                    }
                } : null;

        };

    }

}
