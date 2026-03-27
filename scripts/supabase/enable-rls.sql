-- PrepWISE Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor
-- Tables use snake_case names (Prisma @@map)

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

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

-- ============================================
-- 2. USER TABLE
-- ============================================

CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- ============================================
-- 3. USER-OWNED TABLES
-- ============================================

CREATE POLICY "Users own sessions" ON sessions FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own messages" ON messages FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own journal" ON journal_entries FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own subscriptions" ON subscriptions FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own diaries" ON diaries FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own mood" ON mood_entries FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own goals" ON goals FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own homework" ON homework FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own proactive" ON proactive_messages FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own surveys" ON alliance_surveys FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own safety" ON safety_logs FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own gmat sessions" ON gmat_sessions FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own progress" ON topic_progress FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own errors" ON error_logs FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own mocks" ON mock_tests FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own study journal" ON study_journal FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own profiles" ON user_profiles FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own milestones" ON milestones FOR ALL USING (true);

-- ============================================
-- 4. SYSTEM TABLES
-- ============================================

CREATE POLICY "Rate limits server only" ON rate_limits FOR ALL USING (false);
CREATE POLICY "Knowledge base read" ON knowledge_base FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. VERIFY
-- ============================================

SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
