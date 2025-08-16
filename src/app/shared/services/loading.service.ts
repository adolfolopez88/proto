import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  key: string;
  message?: string;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState[]>([]);
  private loadingStates = new Map<string, LoadingState>();

  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Show loading indicator
   * @param key Unique identifier for the loading state
   * @param message Optional message to display
   * @param progress Optional progress percentage (0-100)
   */
  show(key: string, message?: string, progress?: number): void {
    const loadingState: LoadingState = {
      key,
      message,
      progress
    };

    this.loadingStates.set(key, loadingState);
    this.updateLoadingSubject();
  }

  /**
   * Hide loading indicator
   * @param key Unique identifier for the loading state to hide
   */
  hide(key: string): void {
    this.loadingStates.delete(key);
    this.updateLoadingSubject();
  }

  /**
   * Update loading state message or progress
   * @param key Unique identifier for the loading state
   * @param message New message
   * @param progress New progress percentage
   */
  update(key: string, message?: string, progress?: number): void {
    const existingState = this.loadingStates.get(key);
    if (existingState) {
      const updatedState: LoadingState = {
        ...existingState,
        message: message !== undefined ? message : existingState.message,
        progress: progress !== undefined ? progress : existingState.progress
      };
      
      this.loadingStates.set(key, updatedState);
      this.updateLoadingSubject();
    }
  }

  /**
   * Hide all loading indicators
   */
  hideAll(): void {
    this.loadingStates.clear();
    this.updateLoadingSubject();
  }

  /**
   * Check if any loading indicator is active
   */
  isLoading(): Observable<boolean> {
    return new Observable(subscriber => {
      this.loading$.subscribe(states => {
        subscriber.next(states.length > 0);
      });
    });
  }

  /**
   * Check if specific loading indicator is active
   * @param key Unique identifier to check
   */
  isLoadingKey(key: string): Observable<boolean> {
    return new Observable(subscriber => {
      this.loading$.subscribe(states => {
        subscriber.next(states.some(state => state.key === key));
      });
    });
  }

  /**
   * Get current loading states
   */
  getCurrentStates(): LoadingState[] {
    return Array.from(this.loadingStates.values());
  }

  /**
   * Get specific loading state
   * @param key Unique identifier
   */
  getState(key: string): LoadingState | undefined {
    return this.loadingStates.get(key);
  }

  /**
   * Execute a function with loading indicator
   * @param key Unique identifier for loading state
   * @param fn Function to execute
   * @param message Optional loading message
   */
  async executeWithLoading<T>(
    key: string, 
    fn: () => Promise<T>, 
    message?: string
  ): Promise<T> {
    try {
      this.show(key, message);
      const result = await fn();
      return result;
    } finally {
      this.hide(key);
    }
  }

  /**
   * Execute multiple functions with progress tracking
   * @param key Unique identifier for loading state
   * @param tasks Array of functions to execute
   * @param message Base message for loading
   */
  async executeWithProgress<T>(
    key: string,
    tasks: Array<() => Promise<T>>,
    message: string = 'Procesando'
  ): Promise<T[]> {
    const results: T[] = [];
    const total = tasks.length;

    try {
      this.show(key, `${message}... (0/${total})`, 0);

      for (let i = 0; i < tasks.length; i++) {
        const progress = Math.round((i / total) * 100);
        this.update(key, `${message}... (${i}/${total})`, progress);
        
        const result = await tasks[i]();
        results.push(result);
      }

      this.update(key, `${message} completado`, 100);
      
      // Show completion for a brief moment
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return results;
    } finally {
      this.hide(key);
    }
  }

  private updateLoadingSubject(): void {
    const currentStates = Array.from(this.loadingStates.values());
    this.loadingSubject.next(currentStates);
  }
}