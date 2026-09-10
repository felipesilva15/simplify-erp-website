import { AfterViewChecked, ChangeDetectionStrategy, Component, forwardRef, input, InputSignal, Type, ViewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-filter-component-host',
  imports: [NgComponentOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterComponentHostComponent),
      multi: true,
    },
  ],
  template: `<ng-container #outlet="ngComponentOutlet" [ngComponentOutlet]="component()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class FilterComponentHostComponent implements ControlValueAccessor, AfterViewChecked {
  component: InputSignal<Type<any>> = input.required<Type<any>>();

  @ViewChild(NgComponentOutlet) private outlet!: NgComponentOutlet;

  private innerControlValueAccessor: ControlValueAccessor | null = null;
  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};
  private isDisabled = false;
  private pendingValue: unknown;

  ngAfterViewChecked(): void {
    const instance = this.outlet?.componentInstance as ControlValueAccessor | null;

    if (instance && instance !== this.innerControlValueAccessor) {
      this.wireInnerControlValueAccessor(instance);
    }
  }

  private wireInnerControlValueAccessor(instance: ControlValueAccessor): void {
    this.innerControlValueAccessor = instance;

    instance.registerOnChange((value: unknown) => this.onChange(value));
    instance.registerOnTouched(() => this.onTouched());
    instance.setDisabledState?.(this.isDisabled);

    if (this.pendingValue != null) {
      instance.writeValue?.(this.pendingValue);
    }
  }

  writeValue(value: unknown): void {
    this.pendingValue = value;
    this.innerControlValueAccessor?.writeValue?.(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.innerControlValueAccessor?.setDisabledState?.(isDisabled);
  }
}