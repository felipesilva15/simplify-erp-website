import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeNode } from 'primeng/api';
import { ColumnType } from '../../../core/enums/column-type';
import { TreeTableColumn } from '../../../core/models/tree-table-column';
import { TreeViewComponent } from './tree-view.component';

describe('TreeViewComponent', () => {
  let component: TreeViewComponent;
  let fixture: ComponentFixture<TreeViewComponent>;

  const columns: TreeTableColumn[] = [
    { field: 'name', header: 'Nome', type: ColumnType.Text },
    { field: 'active', header: 'Ativo', type: ColumnType.Boolean },
  ];

  const nodes: TreeNode[] = [
    {
      key: '1',
      label: 'Raiz',
      data: { id: 1, name: 'Raiz', active: true, level: 0 },
      expanded: false,
      children: [
        {
          key: '1-2',
          label: 'Filho',
          data: { id: 2, name: 'Filho', active: false, level: 1 },
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TreeViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a column for each configured column', () => {
    const headerElements: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(headerElements).map(element => element.textContent?.trim());

    expect(headers).toEqual(['Nome', 'Ativo']);
  });

  it('should render the expand/collapse toggler on tree rows', () => {
    expect(fixture.nativeElement.querySelectorAll('p-treetable-toggler').length).toBeGreaterThan(0);
  });

  it('should not render a row menu button', () => {
    expect(fixture.nativeElement.querySelector('.tree-row-menu-button')).toBeNull();
  });

  it('should emit the right-clicked row record', () => {
    const emitted: unknown[] = [];
    const event = new Event('contextmenu');
    component.contextMenuSelect.subscribe(value => emitted.push(value));

    component.onContextMenuSelect({ originalEvent: event, node: nodes[0] });

    expect(emitted).toEqual([{ event, record: nodes[0].data }]);
  });

  it('should mark only sortable columns as sortable', () => {
    fixture.componentRef.setInput('columns', [
      { field: 'name', header: 'Nome', sortable: true },
      { field: 'active', header: 'Ativo' },
    ]);
    fixture.detectChanges();

    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    expect(headers[0].classList.contains('p-sortable-column')).toBe(true);
    expect(headers[1].classList.contains('p-sortable-column')).toBe(false);
  });

  it('should format cell values using the shared formatter', () => {
    expect(component.formatValue(nodes[0].data, columns[0])).toBe('Raiz');
    expect(component.isTruthyValue(nodes[0].data, columns[1])).toBe(true);
  });

  it('should expand all nodes when expandAll is enabled', () => {
    fixture.componentRef.setInput('expandAll', true);
    fixture.detectChanges();

    expect(nodes[0].expanded).toBe(true);
    expect(nodes[0].children![0].expanded).toBe(false);
  });
});
