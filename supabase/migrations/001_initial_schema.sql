-- ============================================================================
-- BU Trade — Bennett University Campus Marketplace
-- Migration 001: Initial Schema, RLS Policies, Trigger Constraints & RPCs
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLE: profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    course TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 5),
    residence TEXT NOT NULL CHECK (residence IN ('Hostel', 'Day scholar')),
    whatsapp TEXT,
    is_moderator BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_bennett_email CHECK (email ~* '^[a-zA-Z0-9._%+-]+@bennett\.edu\.in$')
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- 2. TABLE: listings
-- ============================================================================
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 120),
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL CHECK (category IN (
        'Books & notes',
        'Electronics',
        'Cycles & transport',
        'Hostel essentials',
        'Furniture',
        'Clothing',
        'Stationery & lab gear',
        'Other'
    )),
    age TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    contact_method TEXT NOT NULL CHECK (contact_method IN ('WhatsApp', 'Phone', 'Email')),
    contact_value TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'delisted')),
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- ============================================================================
-- 3. TABLE: listing_images
-- ============================================================================
CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);

-- ============================================================================
-- 4. TABLE: enquiries
-- ============================================================================
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL DEFAULT 'Hi, is this still available?',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_listing_buyer ON enquiries(listing_id, buyer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_buyer ON enquiries(buyer_id);

-- ============================================================================
-- 5. TABLE: reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================================================
-- 6. TABLE: feedback
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_listing_id ON feedback(listing_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- ============================================================================
-- 7. TRIGGERS: updated_at Automation
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_listings_updated_at ON listings;
CREATE TRIGGER set_listings_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. TRIGGER: Active Listing Cap (Max 10 per Student)
-- ============================================================================
CREATE OR REPLACE FUNCTION check_active_listing_cap()
RETURNS TRIGGER AS $$
DECLARE
    active_count INTEGER;
BEGIN
    -- Only check if the listing is or is becoming active
    IF (NEW.status = 'active') THEN
        IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM 'active' OR OLD.user_id IS DISTINCT FROM NEW.user_id))) THEN
            SELECT COUNT(*) INTO active_count
            FROM listings
            WHERE user_id = NEW.user_id
              AND status = 'active'
              AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

            IF active_count >= 10 THEN
                RAISE EXCEPTION 'Active listing limit reached: Each student can have a maximum of 10 active listings.'
                    USING ERRCODE = '23514'; -- check_violation
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS active_listing_cap_trigger ON listings;
CREATE TRIGGER active_listing_cap_trigger
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION check_active_listing_cap();

-- ============================================================================
-- 9. RPC FUNCTION: Contact Protection (Security Definer)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_protected_listing_contact(target_listing_id UUID)
RETURNS TABLE (
    contact_method TEXT,
    contact_value TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    req_uid UUID := auth.uid();
    l_owner UUID;
    l_method TEXT;
    l_value TEXT;
    is_mod BOOLEAN := FALSE;
    enquiry_exists BOOLEAN := FALSE;
BEGIN
    -- 1. Must be authenticated
    IF req_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required: You must be signed in with your Bennett email to view contact details.'
            USING ERRCODE = '42501';
    END IF;

    -- 2. Fetch the listing
    SELECT user_id, listings.contact_method, listings.contact_value
    INTO l_owner, l_method, l_value
    FROM listings
    WHERE id = target_listing_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- 3. Access granted if caller is the seller
    IF req_uid = l_owner THEN
        contact_method := l_method;
        contact_value := l_value;
        RETURN NEXT;
        RETURN;
    END IF;

    -- 4. Access granted if caller has submitted an enquiry
    SELECT EXISTS (
        SELECT 1 FROM enquiries
        WHERE listing_id = target_listing_id AND buyer_id = req_uid
    ) INTO enquiry_exists;

    IF enquiry_exists THEN
        contact_method := l_method;
        contact_value := l_value;
        RETURN NEXT;
        RETURN;
    END IF;

    -- 5. Access granted if caller is a moderator
    SELECT COALESCE(is_moderator, FALSE) INTO is_mod
    FROM profiles
    WHERE id = req_uid;

    IF is_mod THEN
        contact_method := l_method;
        contact_value := l_value;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Unauthorized
    RAISE EXCEPTION 'Access denied: You must enquire on this listing before viewing seller contact details.'
        USING ERRCODE = '42501';
END;
$$;

GRANT EXECUTE ON FUNCTION get_protected_listing_contact(UUID) TO authenticated;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all 6 tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS: profiles
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are readable by authenticated users and visitors" ON profiles;
CREATE POLICY "Profiles are readable by authenticated users and visitors"
    ON profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile"
    ON profiles FOR DELETE
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- RLS: listings
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Active listings readable by all; own/all readable by owner/moderator" ON listings;
CREATE POLICY "Active listings readable by all; own/all readable by owner/moderator"
    ON listings FOR SELECT
    USING (
        status = 'active'
        OR auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true)
    );

DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
CREATE POLICY "Authenticated users can create listings"
    ON listings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners and moderators can update listings" ON listings;
CREATE POLICY "Owners and moderators can update listings"
    ON listings FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true)
    );

DROP POLICY IF EXISTS "Owners and moderators can delete listings" ON listings;
CREATE POLICY "Owners and moderators can delete listings"
    ON listings FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true)
    );

-- ----------------------------------------------------------------------------
-- RLS: listing_images
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Images are readable if listing is readable" ON listing_images;
CREATE POLICY "Images are readable if listing is readable"
    ON listing_images FOR SELECT
    USING (EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id));

DROP POLICY IF EXISTS "Listing owners can insert images" ON listing_images;
CREATE POLICY "Listing owners can insert images"
    ON listing_images FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Listing owners can update images" ON listing_images;
CREATE POLICY "Listing owners can update images"
    ON listing_images FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Listing owners can delete images" ON listing_images;
CREATE POLICY "Listing owners can delete images"
    ON listing_images FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- RLS: enquiries
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Enquiries readable by buyer, seller, or moderator" ON enquiries;
CREATE POLICY "Enquiries readable by buyer, seller, or moderator"
    ON enquiries FOR SELECT
    USING (
        auth.uid() = buyer_id
        OR EXISTS (SELECT 1 FROM listings WHERE listings.id = enquiries.listing_id AND listings.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true)
    );

DROP POLICY IF EXISTS "Buyers can create enquiries on others' listings" ON enquiries;
CREATE POLICY "Buyers can create enquiries on others' listings"
    ON enquiries FOR INSERT
    WITH CHECK (
        auth.uid() = buyer_id
        AND NOT EXISTS (
            SELECT 1 FROM listings WHERE listings.id = listing_id AND listings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Buyers can update their own enquiries" ON enquiries;
CREATE POLICY "Buyers can update their own enquiries"
    ON enquiries FOR UPDATE
    USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers or moderators can delete enquiries" ON enquiries;
CREATE POLICY "Buyers or moderators can delete enquiries"
    ON enquiries FOR DELETE
    USING (
        auth.uid() = buyer_id
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true)
    );

-- ----------------------------------------------------------------------------
-- RLS: reports
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Reports readable by reporter or moderator" ON reports;
CREATE POLICY "Reports readable by reporter or moderator"
    ON reports FOR SELECT
    USING (
        auth.uid() = reporter_id
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true)
    );

DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
CREATE POLICY "Authenticated users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Only moderators can update reports" ON reports;
CREATE POLICY "Only moderators can update reports"
    ON reports FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true));

DROP POLICY IF EXISTS "Only moderators can delete reports" ON reports;
CREATE POLICY "Only moderators can delete reports"
    ON reports FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true));

-- ----------------------------------------------------------------------------
-- RLS: feedback
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Feedback readable by all" ON feedback;
CREATE POLICY "Feedback readable by all"
    ON feedback FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON feedback;
CREATE POLICY "Authenticated users can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own feedback" ON feedback;
CREATE POLICY "Users can update their own feedback"
    ON feedback FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own feedback" ON feedback;
CREATE POLICY "Users can delete their own feedback"
    ON feedback FOR DELETE
    USING (auth.uid() = user_id);
