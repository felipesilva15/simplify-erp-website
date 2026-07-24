import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog-service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogConfig } from '../../core/models/confirm-dialog-config';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let confirmationService: { confirm: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    confirmationService = { confirm: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ConfirmDialogService,
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    });

    service = TestBed.inject(ConfirmDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call confirmationService.confirm', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({ message: 'Tem certeza?' });

    expect(confirmationService.confirm).toHaveBeenCalledOnce();
  });

  it('should resolve true when user accepts', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    const result = await service.confirm({ message: 'Tem certeza?' });

    expect(result).toBe(true);
  });

  it('should resolve false when user rejects', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.reject());

    const result = await service.confirm({ message: 'Tem certeza?' });

    expect(result).toBe(false);
  });

  it('should use default header when not provided', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({ message: 'Tem certeza?' });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.header).toBe('Atenção');
  });

  it('should use provided header', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({ message: 'Tem certeza?', header: 'Confirmação' });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.header).toBe('Confirmação');
  });

  it('should pass message and icon to confirmationService', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({ message: 'Tem certeza?', icon: 'pi pi-info' });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.message).toBe('Tem certeza?');
    expect(callArgs.icon).toBe('pi pi-info');
  });

  it('should use default reject button props when not provided', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({ message: 'Tem certeza?' });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.rejectButtonProps.label).toBe('Não');
    expect(callArgs.rejectButtonProps.severity).toBe('secondary');
  });

  it('should use custom reject button props when provided', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({
      message: 'Tem certeza?',
      rejectButtonProps: { label: 'Cancelar', severity: 'danger' },
    });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.rejectButtonProps.label).toBe('Cancelar');
    expect(callArgs.rejectButtonProps.severity).toBe('danger');
  });

  it('should use default accept button props when not provided', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({ message: 'Tem certeza?' });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.acceptButtonProps.label).toBe('Sim');
    expect(callArgs.acceptButtonProps.severity).toBeUndefined();
  });

  it('should use custom accept button props when provided', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({
      message: 'Tem certeza?',
      acceptButtonProps: { label: 'OK', severity: 'success' },
    });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.acceptButtonProps.label).toBe('OK');
    expect(callArgs.acceptButtonProps.severity).toBe('success');
  });

  it('should use default reject severity when rejectButtonProps has label but no severity', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({
      message: 'Tem certeza?',
      rejectButtonProps: { label: 'Sair' },
    });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.rejectButtonProps.label).toBe('Sair');
    expect(callArgs.rejectButtonProps.severity).toBe('secondary');
  });

  it('should use provided severity for acceptButtonProps', async () => {
    confirmationService.confirm.mockImplementation((params: any) => params.accept());

    await service.confirm({
      message: 'Tem certeza?',
      acceptButtonProps: { severity: 'danger' },
    });

    const callArgs = confirmationService.confirm.mock.calls[0][0];
    expect(callArgs.acceptButtonProps.label).toBe('Sim');
    expect(callArgs.acceptButtonProps.severity).toBe('danger');
  });
});
