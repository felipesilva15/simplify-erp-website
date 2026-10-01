import { BaseEntity } from '../../../../core/models/base-entity';

/**
 * Contato do parceiro. Entidade filha (1:N) do `Partner`, editada em memória e
 * enviada junto na submissão do formulário pai.
 */
export interface Contact extends BaseEntity {
    id: number;
    name: string;
    email?: string;
    phone: string;
    position?: string;
    is_primary: boolean;
    notes?: string;
}
