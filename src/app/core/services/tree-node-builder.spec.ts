import { TestBed } from '@angular/core/testing';

import { TreeNodeBuilder } from './tree-node-builder';

describe('TreeNodeBuilder', () => {
  let service: TreeNodeBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeNodeBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
