import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'fileName'})
export class FileNamePipe implements PipeTransform {

    transform(url: string) {
        return url && typeof url === 'string' ? url.split('/').reverse()[0] : url;
    }

}
