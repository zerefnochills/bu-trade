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

// Singleton instance — stored on globalThis so it survives Next.js hot-reload
// module re-evaluations in development mode (preserves in-memory Mock DB state).
const _g = globalThis as typeof globalThis & { __bu_trade_db?: IDatabaseService };

/**
 * Retrieves the active database service instance (Singleton).
 */
export function getDatabaseService(): IDatabaseService {
  if (!_g.__bu_trade_db) {
    if (isMockMode()) {
      _g.__bu_trade_db = new MockDatabaseService();
    } else {
      _g.__bu_trade_db = new SupabaseDatabaseService();
    }
  }
  return _g.__bu_trade_db;
}

/**
 * Resets the active database service instance (for testing and isolation).
 */
export function resetDatabaseServiceInstance(): void {
  delete _g.__bu_trade_db;
}
