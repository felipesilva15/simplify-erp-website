import { BaseEntity } from '../../../../core/models/base-entity';

export interface Contact extends BaseEntity {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    mobile?: string;
    department?: string;
    main: boolean;
    notes?: string;
}
