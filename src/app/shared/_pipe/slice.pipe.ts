import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'slice' })
export class SlicePipe implements PipeTransform {
  constructor() {}

  transform(text: string, idxs: number[]) {
    if (text.length <= idxs[1]) {
      return text;
    }

    return text.slice(idxs[0], idxs[1]) + '...';
  }
}
