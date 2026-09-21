import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { ExportExtension } from '../enums/export-extension';
import { ExportFormat } from '../enums/export-format';

export interface ExportMenuItem extends MenuItem {
    extension: ExportExtension;
    format: ExportFormat;
    permission?: string;
    /**
     * Função a ser executada quando o item do menu for acionado.
     * Quando informada, substitui o fluxo padrão de exportação (service.export),
     * permitindo exportações customizadas. Caso não seja informada, o método
     * padrão do service será utilizado.
     */
    command?: (event?: MenuItemCommandEvent) => void;
}