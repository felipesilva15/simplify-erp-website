export interface CrudFormConfig<T> {
    navigateAfterSave?: (entity: T) => void;
    successMessage?: string;
    permission?: {
        create?: string;
        update?: string;
        view?: string;
    };
    validSubmit?: () => boolean; 
    beforeSubmit?: (payload: Partial<T>) => Partial<T>;
    afterSubmit?: (entity: T) => void;
}
