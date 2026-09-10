import { DocumentPipe } from './document-pipe';

describe('DocumentPipe', () => {
  let pipe: DocumentPipe;

  beforeEach(() => {
    pipe = new DocumentPipe();
  });

  it('should create an instance of pipe', () => {
    expect(pipe).toBeTruthy();
  });
});