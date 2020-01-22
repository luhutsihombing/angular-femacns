import {AbstractControl, FormArray, ValidatorFn} from '@angular/forms';
import {Injectable} from '@angular/core';

@Injectable()
export class FeedbackValidator {

    // Only apply this validator to allowFillIn control
    minChoices(): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } => {

            const choiceForm = control.parent && <FormArray>control.parent.get('choices');

            if (!control.value && choiceForm && choiceForm.controls && choiceForm.controls.length < 2) {

                return {'minChoices': {'minChoices': 2}};

            }

            return null;

        };

    }

}

