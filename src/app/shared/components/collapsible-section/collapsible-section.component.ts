import { ChangeDetectionStrategy, Component, input, InputSignal, signal, WritableSignal } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-collapsible-section',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collapsible-section.component.html',
  styleUrl: './collapsible-section.component.scss',
})
export class CollapsibleSectionComponent {
  readonly title: InputSignal<string> = input.required<string>();

  readonly open: WritableSignal<boolean> = signal<boolean>(true);

  protected readonly bodyId: string = `collapsible-section-body-${++nextId}`;

  toggle(): void {
    this.open.update((value) => !value);
  }
}