-- ============================================================================
-- BU Trade — Bennett University Campus Marketplace
-- Migration 002: Feedbacks with Reddit Voting & Trade/Borrow Requests
-- ============================================================================

-- ============================================================================
-- 1. TABLE: feedback_posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_title TEXT NOT NULL CHECK (char_length(item_title) > 0 AND char_length(item_title) <= 120),
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    score INTEGER NOT NULL DEFAULT 0,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    downvotes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_posts_user_id ON feedback_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_created_at ON feedback_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_score ON feedback_posts(score DESC);

-- ============================================================================
-- 2. TABLE: feedback_votes
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES feedback_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_feedback_user_vote UNIQUE (feedback_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback_id ON feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_user_id ON feedback_votes(user_id);

-- ============================================================================
-- 3. TABLE: trade_borrow_requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS trade_borrow_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 120),
    description TEXT NOT NULL DEFAULT '',
    request_type TEXT NOT NULL CHECK (request_type IN ('borrow', 'trade')),
    duration TEXT NOT NULL CHECK (char_length(duration) > 0 AND char_length(duration) <= 60),
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
    contact_method TEXT NOT NULL CHECK (contact_method IN ('WhatsApp', 'Phone', 'Email')),
    contact_value TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'closed')),
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_borrow_user_id ON trade_borrow_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_borrow_type ON trade_borrow_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_trade_borrow_category ON trade_borrow_requests(category);
CREATE INDEX IF NOT EXISTS idx_trade_borrow_status ON trade_borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_trade_borrow_created_at ON trade_borrow_requests(created_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE feedback_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_borrow_requests ENABLE ROW LEVEL SECURITY;

-- feedback_posts RLS
CREATE POLICY "Feedback posts readable by all"
    ON feedback_posts FOR SELECT
    USING (true);

CREATE POLICY "Auth users can insert feedback"
    ON feedback_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own feedback"
    ON feedback_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own feedback"
    ON feedback_posts FOR DELETE
    USING (auth.uid() = user_id);

-- feedback_votes RLS
CREATE POLICY "Feedback votes readable by all"
    ON feedback_votes FOR SELECT
    USING (true);

CREATE POLICY "Auth users can vote"
    ON feedback_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vote"
    ON feedback_votes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote"
    ON feedback_votes FOR DELETE
    USING (auth.uid() = user_id);

-- trade_borrow_requests RLS
CREATE POLICY "Trade/Borrow readable by all"
    ON trade_borrow_requests FOR SELECT
    USING (true);

CREATE POLICY "Auth users can insert trade/borrow"
    ON trade_borrow_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update trade/borrow"
    ON trade_borrow_requests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete trade/borrow"
    ON trade_borrow_requests FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Grant Schema & Table Permissions to Supabase Roles
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

