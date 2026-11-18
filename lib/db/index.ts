// ============================================================================
// BU Trade — Database Service Factory & Dual-Mode Resolver
// Automatically switches between Supabase and Mock Database Service
// ============================================================================

import { MockDatabaseService } from './mock';
import { SupabaseDatabaseService } from './supabase';
import { IDatabaseService } from './types';

export * from './types';
export { MockDatabaseService } from './mock';
export { SupabaseDatabaseService } from './supabase';

/**
 * Returns true if the application should use the offline in-memory/localStorage mock service.
 * Triggered when:
 * 1. NEXT_PUBLIC_USE_MOCK_DB === 'true'
 * 2. NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing or set to placeholder values.
 */
export function isMockMode(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    return true;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-project') ||
    supabaseUrl.includes('example.com') ||
    supabaseUrl.trim() === ''
  ) {
    return true;
  }

  return false;
}

// Singleton instance
let databaseServiceInstance: IDatabaseService | null = null;

/**
 * Retrieves the active database service instance (Singleton).
 */
export function getDatabaseService(): IDatabaseService {
  if (!databaseServiceInstance) {
    if (isMockMode()) {
      databaseServiceInstance = new MockDatabaseService();
    } else {
      databaseServiceInstance = new SupabaseDatabaseService();
    }
  }
  return databaseServiceInstance;
}

/**
 * Resets the active database service instance (for testing and isolation).
 */
export function resetDatabaseServiceInstance(): void {
  databaseServiceInstance = null;
}
