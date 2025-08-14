export interface BaseEntity {
    id?: string;
    createdAt?: Date | any;
    updatedAt?: Date | any;
    createdBy?: string;
    updatedBy?: string;
    isActive?: boolean;
}