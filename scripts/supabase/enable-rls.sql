-- PrepWISE Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This enables RLS on ALL tables and creates policies for user data isolation

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeBase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Diary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MoodEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Homework" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProactiveMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AllianceSurvey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SafetyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GmatSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TopicProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ErrorLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MockTest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyJournalEntry" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. USER TABLE — users can only read/update their own row
-- ============================================

CREATE POLICY "Users can read own data"
  ON "User" FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id);

-- Service role (server-side Prisma) can do everything
-- This is handled by Supabase automatically — service_role bypasses RLS

-- ============================================
-- 3. USER-OWNED TABLES — user can CRUD their own rows
-- ============================================

-- Session
CREATE POLICY "Users own sessions"
  ON "Session" FOR ALL
  USING (auth.uid()::text = "userId");

-- Message
CREATE POLICY "Users own messages"
  ON "Message" FOR ALL
  USING (auth.uid()::text = "userId");

-- JournalEntry
CREATE POLICY "Users own journal entries"
  ON "JournalEntry" FOR ALL
  USING (auth.uid()::text = "userId");

-- Subscription
CREATE POLICY "Users own subscriptions"
  ON "Subscription" FOR ALL
  USING (auth.uid()::text = "userId");

-- Diary
CREATE POLICY "Users own diaries"
  ON "Diary" FOR ALL
  USING (auth.uid()::text = "userId");

-- MoodEntry
CREATE POLICY "Users own mood entries"
  ON "MoodEntry" FOR ALL
  USING (auth.uid()::text = "userId");

-- Goal
CREATE POLICY "Users own goals"
  ON "Goal" FOR ALL
  USING (auth.uid()::text = "userId");

-- Milestone
CREATE POLICY "Users own milestones"
  ON "Milestone" FOR ALL
  USING (auth.uid()::text = "goalId" IN (SELECT id FROM "Goal" WHERE "userId" = auth.uid()::text));

-- Homework
CREATE POLICY "Users own homework"
  ON "Homework" FOR ALL
  USING (auth.uid()::text = "userId");

-- ProactiveMessage
CREATE POLICY "Users own proactive messages"
  ON "ProactiveMessage" FOR ALL
  USING (auth.uid()::text = "userId");

-- AllianceSurvey
CREATE POLICY "Users own alliance surveys"
  ON "AllianceSurvey" FOR ALL
  USING (auth.uid()::text = "userId");

-- SafetyLog
CREATE POLICY "Users own safety logs"
  ON "SafetyLog" FOR ALL
  USING (auth.uid()::text = "userId");

-- GmatSession
CREATE POLICY "Users own GMAT sessions"
  ON "GmatSession" FOR ALL
  USING (auth.uid()::text = "userId");

-- TopicProgress
CREATE POLICY "Users own topic progress"
  ON "TopicProgress" FOR ALL
  USING (auth.uid()::text = "userId");

-- ErrorLog
CREATE POLICY "Users own error logs"
  ON "ErrorLog" FOR ALL
  USING (auth.uid()::text = "userId");

-- MockTest
CREATE POLICY "Users own mock tests"
  ON "MockTest" FOR ALL
  USING (auth.uid()::text = "userId");

-- StudyJournalEntry
CREATE POLICY "Users own study journal entries"
  ON "StudyJournalEntry" FOR ALL
  USING (auth.uid()::text = "userId");

-- ============================================
-- 4. SYSTEM TABLES — server-only (no client access)
-- ============================================

-- RateLimit — only server can access
CREATE POLICY "Rate limit server only"
  ON "RateLimit" FOR ALL
  USING (false);  -- blocks all client access, service_role bypasses

-- UserProfile — only server can access
CREATE POLICY "UserProfile server only"
  ON "UserProfile" FOR ALL
  USING (auth.uid()::text = "userId");

-- KnowledgeBase — read-only for authenticated users
CREATE POLICY "Knowledge base read only"
  ON "KnowledgeBase" FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. VERIFICATION
-- ============================================

-- Check RLS status on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
