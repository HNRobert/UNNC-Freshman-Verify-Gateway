// Cache utility for identity configurations
// This provides in-memory caching to reduce file system reads

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  refreshFunction?: () => Promise<T>; // Function to refresh the data
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  private refreshInterval: NodeJS.Timeout | null = null;

  set<T>(key: string, data: T, ttl?: number, refreshFunction?: () => Promise<T>): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      refreshFunction,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry has expired
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry has expired
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Refresh cache entries that are near expiration or expired
  async refreshCache(): Promise<void> {
    const now = Date.now();
    const refreshPromises: Promise<void>[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      const shouldRefresh = 
        age > entry.ttl * 0.8 || // Refresh when 80% of TTL has passed
        (age > entry.ttl && entry.refreshFunction); // Refresh expired entries with refresh function

      if (shouldRefresh && entry.refreshFunction) {
        refreshPromises.push(this.refreshEntry(key, entry));
      }
    }

    await Promise.allSettled(refreshPromises);
  }

  private async refreshEntry(key: string, entry: CacheEntry<unknown>): Promise<void> {
    try {
      if (entry.refreshFunction) {
        const newData = await entry.refreshFunction();
        this.cache.set(key, {
          data: newData,
          timestamp: Date.now(),
          ttl: entry.ttl,
          refreshFunction: entry.refreshFunction,
        });
        console.log(`Cache refreshed for key: ${key}`);
      }
    } catch (error) {
      console.error(`Failed to refresh cache for key ${key}:`, error);
      // Keep the old data if refresh fails
    }
  }

  // Start automatic refresh interval
  startAutoRefresh(intervalMs: number = 2 * 60 * 1000): void { // Default: 2 minutes
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshCache();
        this.cleanup(); // Also cleanup expired entries
      } catch (error) {
        console.error('Error during cache refresh:', error);
      }
    }, intervalMs);
  }

  // Stop automatic refresh
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

// Export a singleton instance
export const cache = new MemoryCache();

// Auto-cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);

  // Start auto-refresh every 2 minutes
  cache.startAutoRefresh(2 * 60 * 1000);
}
