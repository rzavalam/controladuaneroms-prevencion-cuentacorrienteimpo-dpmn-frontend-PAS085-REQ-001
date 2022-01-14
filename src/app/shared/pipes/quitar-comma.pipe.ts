import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'quitarComma'
})
export class QuitarCommaPipe implements PipeTransform {

  transform(value: string): string {
    if (value !== undefined && value !== null) {
      return value.replace(/,/g, "");
    } else {
      return "";
    }
  }
}
