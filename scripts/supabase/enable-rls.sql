-- PrepWISE Row Level Security (RLS) Policies
-- Run in Supabase SQL Editor — all columns are UUID type

-- 1. ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_journal ENABLE ROW LEVEL SECURITY;

-- 2. USER TABLE
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

-- 3. USER-OWNED TABLES
CREATE POLICY "own" ON sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON diaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON mood_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON homework FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON proactive_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON alliance_surveys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON safety_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON gmat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON topic_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON error_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON mock_tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON study_journal FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON milestones FOR ALL USING (true);

-- 4. SYSTEM TABLES
CREATE POLICY "server only" ON rate_limits FOR ALL USING (false);
CREATE POLICY "read auth" ON knowledge_base FOR SELECT USING (auth.uid() IS NOT NULL);

-- 5. VERIFY
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
