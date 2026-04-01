// agents/memory-worker.ts
// SamiWISE — Memory Worker (Railway background service)
// Runs as a worker process that listens for completed sessions
// and automatically runs the Memory Agent to update learner profiles.

import { buildGmatMemoryPrompt, mergeGmatProfile, GmatLearnerProfile } from './gmat/memory'

const POLL_INTERVAL = 10_000 // Check for new sessions every 10 seconds

async function processCompletedSessions() {
  // TODO: In production, this would:
  // 1. Query DB for sessions where memoryUpdated = false and endedAt IS NOT NULL
  // 2. For each session:
  //    a. Load the session transcript
  //    b. Load the existing learner profile
  //    c. Run the Memory Agent (LLM call) to extract new information
  //    d. Merge the extraction with the existing profile
  //    e. Save the updated profile to DB
  //    f. Mark the session as memoryUpdated = true
  //
  // This is a background worker — it runs independently of the main agent server.

  console.log('[Memory Worker] Checking for completed sessions...')

  // Placeholder: In production, replace with actual DB queries
  // const prisma = new PrismaClient()
  // const unprocessedSessions = await prisma.gmatSession.findMany({
  //   where: { memoryUpdated: false, endedAt: { not: null } },
  //   include: { user: { select: { gmatProfile: true } } },
  // })
  //
  // for (const session of unprocessedSessions) {
  //   const existingProfile = session.user.gmatProfile as GmatLearnerProfile | null
  //   const prompt = buildGmatMemoryPrompt(session.transcript || '', existingProfile)
  //
  //   // Call LLM to extract memory
  //   const extraction = await callLLM(prompt) // Groq or Claude
  //   const parsed = JSON.parse(extraction)
  //
  //   // Merge with existing profile
  //   const updatedProfile = mergeGmatProfile(parsed, existingProfile)
  //
  //   // Save to DB
  //   await prisma.user.update({
  //     where: { id: session.userId },
  //     data: { gmatProfile: updatedProfile },
  //   })
  //   await prisma.gmatSession.update({
  //     where: { id: session.id },
  //     data: { memoryUpdated: true },
  //   })
  //
  //   console.log(`[Memory Worker] Updated profile for user ${session.userId}`)
  // }
}

async function main() {
  console.log('🧠 SamiWISE Memory Worker started')
  console.log(`   Poll interval: ${POLL_INTERVAL / 1000}s`)
  console.log('   Waiting for completed sessions...\n')

  // Main polling loop
  while (true) {
    try {
      await processCompletedSessions()
    } catch (error) {
      console.error('[Memory Worker] Error:', error)
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
  }
}

main().catch(console.error)
