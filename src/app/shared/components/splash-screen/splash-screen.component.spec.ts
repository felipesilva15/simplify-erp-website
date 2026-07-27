import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashScreenComponent } from './splash-screen.component';

describe('SplashScreenComponent', () => {
  let component: SplashScreenComponent;
  let fixture: ComponentFixture<SplashScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplashScreenComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SplashScreenComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render message when input is provided', () => {
    fixture.componentRef.setInput('message', 'Carregando...');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const paragraph = compiled.querySelector('p');
    expect(paragraph).toBeTruthy();
    expect(paragraph?.textContent?.trim()).toBe('Carregando...');
  });

  it('should render empty message when input is undefined', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const paragraph = compiled.querySelector('p');
    expect(paragraph).toBeTruthy();
    expect(paragraph?.textContent?.trim()).toBe('');
  });

  it('should render spinner icon', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('i.pi-spinner');
    expect(spinner).toBeTruthy();
    expect(spinner?.classList.contains('pi-spin')).toBe(true);
  });

  it('should render container with correct classes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('div');
    expect(container).toBeTruthy();
    expect(container?.classList.contains('h-screen')).toBe(true);
    expect(container?.classList.contains('w-screen')).toBe(true);
    expect(container?.classList.contains('fadein')).toBe(true);
  });

  it('should update message dynamically', () => {
    fixture.componentRef.setInput('message', 'Primeira mensagem');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent?.trim()).toBe('Primeira mensagem');

    fixture.componentRef.setInput('message', 'Segunda mensagem');
    fixture.detectChanges();

    expect(compiled.querySelector('p')?.textContent?.trim()).toBe('Segunda mensagem');
  });

  it('should handle empty string message', () => {
    fixture.componentRef.setInput('message', '');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent?.trim()).toBe('');
  });
});
