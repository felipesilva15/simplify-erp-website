import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'document'
})
export class DocumentPipe implements PipeTransform {

  transform(value: string): string {
    if (!value || value == null) return '';

    value = value.toUpperCase();
    
    if (value.length === 11) {
      return value.replace(/([a-zA-Z0-9]{3})([a-zA-Z0-9]{3})([a-zA-Z0-9]{3})([a-zA-Z0-9]{2})/, '$1.$2.$3-$4');
    } else if (value.length === 14) {
      return value.replace(/([a-zA-Z0-9]{2})([a-zA-Z0-9]{3})([a-zA-Z0-9]{3})([a-zA-Z0-9]{4})([a-zA-Z0-9]{2})/, '$1.$2.$3/$4-$5');
    } else {
      return value;
    }
  }

}
