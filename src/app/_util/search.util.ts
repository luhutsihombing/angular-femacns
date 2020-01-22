import {Injectable} from '@angular/core';

@Injectable()
export class SearchUtil {

    noSearchParams(params: object): boolean {
        return !Object.values(params)
            .map(val => !!val)
            .find(val => val === true);
    }

}
