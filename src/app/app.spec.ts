import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppLoadingService } from './core/services/app-loading-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { signal } from '@angular/core';

describe('App', () => {
  let mockLoadingService: {
    isLoading: ReturnType<typeof signal<boolean>>;
    message: ReturnType<typeof signal<string>>;
  };

  beforeEach(async () => {
    mockLoadingService = {
      isLoading: signal(false),
      message: signal(''),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AppLoadingService, useValue: mockLoadingService },
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have correct title', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;
    expect(app.title()).toBe('simplify-erp');
  });

  it('should show router-outlet when not loading', () => {
    mockLoadingService.isLoading.set(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-splash-screen')).toBeFalsy();
  });

  it('should show splash-screen when loading', () => {
    mockLoadingService.isLoading.set(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-splash-screen')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeFalsy();
  });

  it('should pass loading message to splash-screen', () => {
    mockLoadingService.isLoading.set(true);
    mockLoadingService.message.set('Carregando dados...');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const splashScreen = fixture.nativeElement.querySelector('app-splash-screen');
    expect(splashScreen).toBeTruthy();
  });

  it('should always render toast component', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-toast')).toBeTruthy();
  });

  it('should always render confirm dialog component', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-confirmdialog')).toBeTruthy();
  });

  it('should hide router-outlet when loading starts', () => {
    mockLoadingService.isLoading.set(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();

    mockLoadingService.isLoading.set(true);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeFalsy();
    expect(compiled.querySelector('app-splash-screen')).toBeTruthy();
  });

  it('should show router-outlet when loading stops', () => {
    mockLoadingService.isLoading.set(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-splash-screen')).toBeTruthy();

    mockLoadingService.isLoading.set(false);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-splash-screen')).toBeFalsy();
  });

  it('should reflect default loading message from service', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance.loadingMessage()).toBe('');
  });

  it('should reflect changed loading message from service', () => {
    mockLoadingService.message.set('Salvando registro...');
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance.loadingMessage()).toBe('Salvando registro...');
  });
});
