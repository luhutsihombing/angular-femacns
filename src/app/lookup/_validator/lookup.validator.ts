import {AbstractControl, ValidatorFn} from '@angular/forms';
import {Injectable} from '@angular/core';

@Injectable()
export class LookupValidator {

    minMeaning(): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } => {

            const detailCode: string = (control.parent && control.parent.get('detailCode').value) || '';

            switch (detailCode) {

                case 'CON_MAX_ACTIVE_BANNER':
                    return control.value && (control.value < 1)
                        ? {
                            'minMeaning': {
                                actualMeaning: `${control.value}`,
                                detailCode,
                                minMeaning: '1'
                            }
                        } : null;

                case 'CON_MAX_ACTIVE_POPUP':
                    return control.value && (control.value < 1)
                        ? {
                            'minMeaning': {
                                actualMeaning: `${control.value}`,
                                detailCode,
                                minMeaning: '1'
                            }
                        } : null;

                default:
                    return null;

            }

        };

    }

}

