import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  FCP: number;
  LCP: number;
  TTFB: number;
  INP: number;
}

export const measureWebVitals = (): void => {
  if (typeof window === 'undefined') return;

  // First Contentful Paint
  if (typeof window.PerformanceObserver !== 'undefined') {
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fcp = entries[0];
          logger.info('FCP:', { value: fcp.startTime, rating: getRating('FCP', fcp.startTime) });
        }
      }).observe({ entryTypes: ['paint'] });
    } catch (e) {
      logger.warn('FCP observer not supported:', e);
    }
    // Largest Contentful Paint
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          logger.info('LCP:', { value: lastEntry.startTime, rating: getRating('LCP', lastEntry.startTime) });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      logger.warn('LCP observer not supported:', e);
    }
  } else {
    logger.warn('PerformanceObserver is not supported in this browser.');
  }

  // Time to First Byte
  const navEntries = performance.getEntriesByType && typeof performance.getEntriesByType === 'function'
    ? performance.getEntriesByType('navigation')
    : [];
  const navigation = navEntries && navEntries.length > 0 ? navEntries[0] as PerformanceNavigationTiming : undefined;
  if (navigation && typeof navigation.responseStart === 'number' && typeof navigation.requestStart === 'number') {
    const ttfb = navigation.responseStart - navigation.requestStart;
    logger.info('TTFB:', { value: ttfb, rating: getRating('TTFB', ttfb) });
  } else {
    logger.warn('Navigation timing not available for TTFB calculation.');
  }

  // Interaction to Next Paint (INP)
  // Only add observer if 'interaction' is supported
  if (
    typeof window.PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes &&
    Array.isArray(PerformanceObserver.supportedEntryTypes) &&
    PerformanceObserver.supportedEntryTypes.includes('interaction')
  ) {
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          logger.info('INP:', {
            value: entry.duration,
            rating: getRating('INP', entry.duration)
          });
        });
      }).observe({ entryTypes: ['interaction'] });
    } catch (e) {
      logger.warn('INP observer not supported:', e);
    }
  } else {
    logger.info('INP is not supported in this browser.');
  }
};

const getRating = (metric: keyof PerformanceMetrics, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = {
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
    INP: [200, 500]
  };

  const [good, poor] = thresholds[metric];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
};

export const measureDatabaseQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    logger.info(`Query: ${queryName}`, { duration });
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Query failed: ${queryName}`, { duration, error });
    throw error;
  }
};
