import {FormArray, FormGroup} from '@angular/forms';

export class FemaService {

    getAllNestedErrors(form: FormGroup | FormArray): { [key: string]: any; } | null {

        let hasError = false;

        const result = Object.keys(form.controls).reduce((acc, key) => {

            const control = form.get(key);

            const errors = (control instanceof FormGroup || control instanceof FormArray)
                ? this.getAllNestedErrors(control)
                : control.errors;

            if (errors) {
                acc[key] = errors;
                hasError = true;
            }

            return acc;

        }, {} as { [key: string]: any; });

        return hasError ? result : null;

    }

}
