// Performance monitoring utilities for development

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration?: number;
}

class PerformanceMonitor {
  private entries = new Map<string, PerformanceEntry>();
  private isEnabled = process.env.NODE_ENV === "development";

  start(name: string): void {
    if (!this.isEnabled) return;

    this.entries.set(name, {
      name,
      startTime: Date.now(),
    });
  }

  end(name: string): number | null {
    if (!this.isEnabled) return null;

    const entry = this.entries.get(name);
    if (!entry) {
      console.warn(`Performance entry "${name}" not found`);
      return null;
    }

    const duration = Date.now() - entry.startTime;
    entry.duration = duration;

    console.log(`⏱️ ${name}: ${duration}ms`);

    return duration;
  }

  measure<T>(name: string, fn: () => T): T;
  measure<T>(name: string, fn: () => Promise<T>): Promise<T>;
  measure<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    if (!this.isEnabled) return fn();

    this.start(name);

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.finally(() => {
          this.end(name);
        });
      }

      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  getEntries(): PerformanceEntry[] {
    return Array.from(this.entries.values());
  }

  clear(): void {
    this.entries.clear();
  }
}

// Export a singleton instance
export const perf = new PerformanceMonitor();

// Utility function to measure async functions
export function withPerformanceTracking<T extends readonly unknown[], R>(
  name: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    return perf.measure(name, () => fn(...args));
  };
}

// Utility function to measure sync functions
export function withSyncPerformanceTracking<T extends readonly unknown[], R>(
  name: string,
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    return perf.measure(name, () => fn(...args));
  };
}
