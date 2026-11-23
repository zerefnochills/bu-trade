// ============================================================================
// BU Trade — Amazon-Style Persistent Client Storage Service
// Handles Recently Viewed history, Saved Items (Wishlist), and View Preferences
// ============================================================================

export interface StoredListingItem {
  id: string;
  title: string;
  price: number;
  category: string;
  image?: string;
  age?: string;
  sellerCourse?: string;
  sellerYear?: number;
}

const STORAGE_KEYS = {
  RECENTLY_VIEWED: 'bu_trade_recently_viewed_v1',
  SAVED_ITEMS: 'bu_trade_saved_items_v1',
  VIEW_MODE: 'bu_trade_view_mode_v1',
} as const;

export function getRecentlyViewed(): StoredListingItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: StoredListingItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentlyViewed().filter((i) => i.id !== item.id);
    const updated = [item, ...current].slice(0, 10); // store last 10 viewed items
    localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or disabled localStorage
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED);
  } catch {
    // Ignore
  }
}

export function getSavedItemIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleSavedItem(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = getSavedItemIds();
    const index = saved.indexOf(id);
    let isNowSaved = false;
    let nextSaved: string[];
    if (index >= 0) {
      nextSaved = saved.filter((i) => i !== id);
      isNowSaved = false;
    } else {
      nextSaved = [id, ...saved];
      isNowSaved = true;
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(nextSaved));
    return isNowSaved;
  } catch {
    return false;
  }
}

export function isItemSaved(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const saved = getSavedItemIds();
  return saved.includes(id);
}

export function getViewModePreference(): 'grid' | 'list' {
  if (typeof window === 'undefined') return 'grid';
  try {
    const val = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return val === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

export function setViewModePreference(mode: 'grid' | 'list'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch {
    // Ignore
  }
}
