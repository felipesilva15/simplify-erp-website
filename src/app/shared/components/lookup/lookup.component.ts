import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of, finalize } from 'rxjs';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LookupItem } from './../../../core/models/lookup-item';
import { LookupFacade } from './../../facades/lookup.facade';
import { LookupResult } from '../../../core/models/lookup-result';

@Component({
  selector: 'app-lookup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    TagModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LookupComponent),
      multi: true,
    },
  ],
  templateUrl: './lookup.component.html',
  styleUrl: './lookup.component.scss',
})
export class LookupComponent {
  @Input({ required: true }) facade!: LookupFacade;
  @Input() multiple: boolean = false;
  @Input() placeholder: string = 'Buscar...';
  @Input() emptyMessage: string = 'Nenhum resultado encontrado';
  @Input() debounce: number = 300;
  @Input() minChars: number = 1;
  @Input() pageSize: number = 10;

  @Output() selected = new EventEmitter<LookupItem | LookupItem[]>();

  protected suggestions: WritableSignal<LookupItem[]> = signal<LookupItem[]>([]);
  protected loading: WritableSignal<boolean> = signal(false);
  protected total: WritableSignal<number | null> = signal<number | null>(null);
 
  private lastQuery: string = '';
 
  protected internalControl: FormControl<LookupItem | LookupItem[] | null> = new FormControl<LookupItem | LookupItem[] | null>(null);
  protected isDisabled: boolean = false;
 
  private destroy$: Subject<void> = new Subject<void>();
  
  protected onTouched: () => void = () => {};
  private onChange: (v: unknown) => void = () => {};
 
  protected readonly String = String;
 
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Propaga mudanças do control interno para o CVA externo
    this.internalControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.onChange(value);
      });
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(event: AutoCompleteCompleteEvent): void {
    this.lastQuery = event.query;
    this.loading.set(true);
 
    this.facade
      .search({ q: event.query, pageSize: this.pageSize })
      .pipe(
        catchError(() => of({ items: [], total: 0 })),
        finalize(() => {
          this.loading.set(false);
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        console.log(result);
        this.suggestions.set(result.items);
        this.total.set(result.total ?? null);
      });
  }
 
  onSelect(item: LookupItem): void {
    const value = this.internalControl.value;
    this.selected.emit(this.multiple ? (value as LookupItem[]) : item);
  }
 
  onUnselect(item: LookupItem): void {
    const value = this.internalControl.value as LookupItem[];
    this.selected.emit(value);
  }
 
  onClear(): void {
    this.onChange(null);
    this.selected.emit(this.multiple ? [] : (null as any));
  }
 
  isSelected(item: LookupItem): boolean {
    const value = this.internalControl.value;
    if (!value || !Array.isArray(value)) return false;
    return (value as LookupItem[]).some((i) => i.key === item.key);
  }
 
  highlight(label: string): string {
    const query = this.lastQuery.trim();
    if (!query) return label;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return label.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }
 
  writeValue(value: LookupItem | LookupItem[] | null): void {
    this.internalControl.setValue(value, { emitEvent: false });
  }
 
  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }
 
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
 
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    isDisabled
      ? this.internalControl.disable({ emitEvent: false })
      : this.internalControl.enable({ emitEvent: false });
  }
}
