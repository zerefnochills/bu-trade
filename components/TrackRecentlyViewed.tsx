'use client';

import { useEffect } from 'react';
import { addRecentlyViewed, StoredListingItem } from '@/lib/storage';

export default function TrackRecentlyViewed({ item }: { item: StoredListingItem }) {
  useEffect(() => {
    if (item && item.id) {
      addRecentlyViewed(item);
    }
  }, [item]);

  return null;
}
