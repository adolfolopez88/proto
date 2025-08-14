// Simple test to check basic TypeScript compilation
import { Injectable } from '@angular/core';

@Injectable()
export class TestService {
    test(): string {
        return 'Hello World';
    }
}

console.log('TypeScript compilation test');