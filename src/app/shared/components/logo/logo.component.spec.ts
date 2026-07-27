import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';
import { LogoType } from '../../enums/logo-type';

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;
  let component: LogoComponent;

  describe('defaults', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LogoComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LogoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct default values', () => {
      expect(component.type).toBe(LogoType.Extended);
      expect(component.height).toBe('42px');
      expect(component.link).toBe('');
      expect(component.fileBasePath).toBe('images');
    });

    it('should return extended logo path by default', () => {
      expect(component.source()).toBe('images/logo-extended.png');
    });

    it('should return logo-extended class by default', () => {
      expect(component.styleClass()).toBe('logo-extended');
    });

    it('should render img without anchor when link is empty', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('a')).toBeNull();
      const img = compiled.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('src')).toBe('images/logo-extended.png');
      expect(img?.style.height).toBe('42px');
      expect(img?.className).toBe('logo-extended');
    });
  });

  describe('with Mini type', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LogoComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LogoComponent);
      component = fixture.componentInstance;
      component.type = LogoType.Mini;
      fixture.detectChanges();
    });

    it('should return mini logo path', () => {
      expect(component.source()).toBe('images/logo-mini.png');
    });

    it('should return logo-mini class', () => {
      expect(component.styleClass()).toBe('logo-mini');
    });
  });

  describe('with link provided', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LogoComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LogoComponent);
      component = fixture.componentInstance;
      component.link = 'https://example.com';
      fixture.detectChanges();
    });

    it('should render img inside anchor', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const anchor = compiled.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute('href')).toBe('https://example.com');
      const img = anchor?.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('src')).toBe('images/logo-extended.png');
      expect(img?.style.height).toBe('42px');
      expect(img?.className).toBe('logo-extended');
    });
  });

  describe('with Mini type, custom height and link', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LogoComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LogoComponent);
      component = fixture.componentInstance;
      component.type = LogoType.Mini;
      component.height = '24px';
      component.link = '/home';
      fixture.detectChanges();
    });

    it('should render mini logo with custom height inside anchor', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const img = compiled.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('src')).toBe('images/logo-mini.png');
      expect(img?.style.height).toBe('24px');
      expect(img?.className).toBe('logo-mini');
    });
  });
});
