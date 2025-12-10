import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytes',
})
export class BytesPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 1): string {
    if (value == null || isNaN(value)) return '';

    if (value === 0) return '0 bytes';

    const k = 1024;
    const sizes = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'];
    const i = Math.floor(Math.log(value) / Math.log(k));

    const converted = (value / Math.pow(k, i)).toFixed(decimals);

    return `${converted} ${sizes[i]}`;
  }
}
