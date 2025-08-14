import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    // String utilities
    capitalize(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    camelCase(str: string): string {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, '');
    }

    kebabCase(str: string): string {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }

    snakeCase(str: string): string {
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase();
    }

    truncate(str: string, maxLength: number, suffix = '...'): string {
        if (str.length <= maxLength) return str;
        return str.slice(0, maxLength - suffix.length) + suffix;
    }

    slugify(str: string): string {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    removeAccents(str: string): string {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Array utilities
    unique<T>(array: T[]): T[] {
        return [...new Set(array)];
    }

    groupBy<T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> {
        return array.reduce((groups, item) => {
            const group = key(item);
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {} as Record<K, T[]>);
    }

    sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    chunk<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    flatten<T>(array: (T | T[])[]): T[] {
        return array.reduce((acc, val) => 
            Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), 
            [] as T[]
        );
    }

    // Object utilities
    deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
        if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as unknown as T;
        if (typeof obj === 'object') {
            const clonedObj: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone((obj as any)[key]);
                }
            }
            return clonedObj;
        }
        return obj;
    }

    deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (this.isObject(source[key]) && this.isObject(result[key])) {
                    result[key] = this.deepMerge(result[key], source[key]);
                } else {
                    result[key] = source[key] as T[Extract<keyof T, string>];
                }
            }
        }
        
        return result;
    }

    omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    }

    pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    }

    getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    setNestedProperty(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    // Date utilities
    formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year.toString())
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
        return date >= startDate && date <= endDate;
    }

    getDateDifference(date1: Date, date2: Date, unit: 'days' | 'hours' | 'minutes' = 'days'): number {
        const diffMs = Math.abs(date2.getTime() - date1.getTime());
        
        switch (unit) {
            case 'days':
                return Math.floor(diffMs / (1000 * 60 * 60 * 24));
            case 'hours':
                return Math.floor(diffMs / (1000 * 60 * 60));
            case 'minutes':
                return Math.floor(diffMs / (1000 * 60));
            default:
                return diffMs;
        }
    }

    // Number utilities
    formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(amount);
    }

    formatPercent(value: number, decimals = 2): string {
        return `${(value * 100).toFixed(decimals)}%`;
    }

    clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // File utilities
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    isImageFile(filename: string): boolean {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        return imageExtensions.includes(this.getFileExtension(filename));
    }

    // URL utilities
    buildQueryString(params: Record<string, any>): string {
        const searchParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== null && value !== undefined && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(v => searchParams.append(key, v.toString()));
                } else {
                    searchParams.set(key, value.toString());
                }
            }
        });
        
        return searchParams.toString();
    }

    parseQueryString(queryString: string): Record<string, string | string[]> {
        const params: Record<string, string | string[]> = {};
        const searchParams = new URLSearchParams(queryString);
        
        searchParams.forEach((value, key) => {
            if (params[key]) {
                if (Array.isArray(params[key])) {
                    (params[key] as string[]).push(value);
                } else {
                    params[key] = [params[key] as string, value];
                }
            } else {
                params[key] = value;
            }
        });
        
        return params;
    }

    // Validation utilities
    isObject(value: any): value is Record<string, any> {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    isEmpty(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (this.isObject(value)) return Object.keys(value).length === 0;
        return false;
    }

    isEqual(a: any, b: any): boolean {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (typeof a !== typeof b) return false;
        
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((val, i) => this.isEqual(val, b[i]));
        }
        
        if (this.isObject(a) && this.isObject(b)) {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(key => this.isEqual(a[key], b[key]));
        }
        
        return false;
    }

    // Performance utilities
    debounce<T extends (...args: any[]) => any>(
        func: T, 
        delay: number
    ): (...args: Parameters<T>) => void {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    throttle<T extends (...args: any[]) => any>(
        func: T, 
        delay: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, delay);
            }
        };
    }

    // ID generation
    generateId(length = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}