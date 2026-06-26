import { ValidatorFn } from "@angular/forms";

export function phoneValidator(): ValidatorFn {
  return (control) => {
    if (!control || !control.value) {
      return null;
    }
    
    const regex: RegExp = /^(\d{2})(9[0-9]{8}|[2-8]\d{7})$/;

    if (!regex.test(control.value)) {
      return {'phone': true};
    }

    return null;
  }
}