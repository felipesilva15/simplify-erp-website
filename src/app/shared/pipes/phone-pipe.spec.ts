import { PhonePipe } from './phone-pipe';

describe('PhonePipe', () => {
  let pipe: PhonePipe;

  beforeEach(() => {
    pipe = new PhonePipe();
  });

  it('should create an instance of pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a string of cell phone to formatted number', () => {
    const formattedValue: string = pipe.transform('11986854256')
    expect(formattedValue).toBe('(11) 98685-4256');
  });

  it('should transform a string of telephone to formatted number', () => {
    const formattedValue: string = pipe.transform('1159825684')
    expect(formattedValue).toBe('(11) 5982-5684');
  });

  it('should return empty string for a empty entry', () => {
    const formattedValue: string = pipe.transform('')
    expect(formattedValue).toBe('');
  });

  it('should return the same entry for a invalid phone number', () => {
    const formattedValue: string = pipe.transform('59852266')
    expect(formattedValue).toBe('59852266');
  });
});