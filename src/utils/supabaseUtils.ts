import { PostgrestError } from '@supabase/supabase-js';

/**
 * A utility function to retry Supabase queries with exponential backoff
 * @param queryFn The query function to execute and retry
 * @param maxAttempts Maximum number of retry attempts
 * @returns The query result or throws the last error
 */
export async function retrySupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  maxAttempts = 3
): Promise<{ data: T | null; error: PostgrestError | null }> {
  let attempts = 0;
  let lastError: PostgrestError | null = null;

  while (attempts < maxAttempts) {
    const result = await queryFn();
    
    if (!result.error) {
      return result;
    }
    
    lastError = result.error;
    attempts++;
    
    if (attempts < maxAttempts) {
      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, attempts - 1) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return { data: null, error: lastError };
}
