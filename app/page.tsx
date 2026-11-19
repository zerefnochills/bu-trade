import { getDatabaseService } from '@/lib/db';
import HomeFeed from '@/components/HomeFeed';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = getDatabaseService();
  const listings = await db.getListings({ status: 'active' });

  return <HomeFeed initialListings={listings} />;
}
