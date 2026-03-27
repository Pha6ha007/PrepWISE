// agents/gmat/memory.ts
// Prepwise — GMAT Memory Agent
// Runs AFTER every session automatically.
// Analyzes conversation and extracts key GMAT learning information.
//
// Runs AFTER every session automatically.
// Analyzes conversation and extracts key information about the learner.
//
// CRITICAL:
// - MERGE with existing profile, never overwrite!
// - Add only NEW information
// - If information contradicts old data — treat as progression/update

export interface GmatLearnerProfile {
  weakTopics: string[]                        // Topics with ≥40% error rate over last 3 sessions
  strongTopics: string[]                      // Topics where learner excels
  effectiveTechniques: string[]               // Explanation styles that worked
  ineffectiveApproaches: string[]             // What didn't work — avoid in future sessions
  insightMoments: string[]                    // "Aha" moments — phrases/analogies that clicked
  conceptLinks: Record<string, string[]>      // Discovered connections between topics
  learningStyle: string                       // Updated observation on learning preferences
  explanationPreference: string | null        // Questions vs direct explanation vs Socratic
  sessionTopics: string[]                     // Main topics covered across sessions
  nextSessionPlan: string | null              // Recommended focus for next session
  scoreTrajectory: string | null              // Accuracy trend observation
  timePressureNotes: string | null            // How learner handles timed conditions
  commonErrorPatterns: string[]               // Recurring mistake types
  targetScore: number | null                  // GMAT target score (205–805)
  currentEstimatedScore: number | null        // Estimated current level
  studyHoursPerWeek: number | null            // Self-reported study hours
  testDate: string | null                     // Planned GMAT date
  preferredDifficulty: 'easy' | 'medium' | 'hard' | '700+' | null
}

export interface GmatMemoryExtractionResult {
  weak_topics: string[]                       // Topics with high error rate this session
  strong_topics: string[]                     // Topics where learner excelled
  effective_techniques: string[]              // What explanation styles worked
  ineffective_approaches: string[]            // What didn't work
  insight_moments: string[]                   // "Aha" moments — phrases that clicked
  concept_links: Record<string, string[]>     // Discovered connections between topics
  learning_style: string                      // Updated observation on learning preferences
  explanation_preference: string | null       // Questions vs direct vs Socratic
  session_topics: string[]                    // Main topics covered
  next_session_plan: string | null            // Recommended focus for next session
  score_trajectory: string | null             // Accuracy trend observation
  time_pressure_notes: string | null          // How learner handles timed conditions
  common_error_patterns: string[]             // Recurring mistake types
}

/**
 * Build the prompt for the GMAT Memory Agent.
 *
 * @param conversation - Full session transcript (user + assistant messages)
 * @param existingProfile - Current learner profile
 */
export function buildGmatMemoryPrompt(
  conversation: string,
  existingProfile: GmatLearnerProfile | null
): string {
  const basePrompt = buildGmatMemoryInstructions()

  let profileContext = ''
  if (existingProfile) {
    profileContext = buildExistingProfileContext(existingProfile)
  }

  return `${basePrompt}

${profileContext}

## Conversation to analyze:

${conversation}

## Your task:

Analyze this GMAT tutoring conversation and extract new information about the learner. Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "weak_topics": ["topics where learner struggled or made errors"],
  "strong_topics": ["topics where learner answered correctly and showed understanding"],
  "effective_techniques": ["explanation styles that worked (e.g., 'visual diagram', 'step-by-step walkthrough', 'analogy to real life')"],
  "ineffective_approaches": ["what did NOT work or what learner resisted"],
  "insight_moments": ["phrases or analogies that clearly 'clicked' for the learner"],
  "concept_links": {"topic": ["connected_topics"]},
  "learning_style": "updated observation on how this learner learns best",
  "explanation_preference": "questions vs direct explanation vs Socratic (or null)",
  "session_topics": ["main GMAT topics covered in this session"],
  "next_session_plan": "recommended focus for next session based on this session's results (or null)",
  "score_trajectory": "observation about accuracy trend (or null)",
  "time_pressure_notes": "observations about how learner handles time pressure (or null)",
  "common_error_patterns": ["recurring mistake patterns (e.g., 'misreads DS question stem', 'forgets to check both statements together')"]
}

IMPORTANT:
- Only include NEW information not already in their profile
- If no new information in a field, use empty array [] or null
- Return valid JSON only, no markdown code blocks
- All strings must use double quotes
- Focus on GMAT-specific learning patterns, not general conversation`
}

function buildGmatMemoryInstructions(): string {
  return `You are a Memory Agent for Prepwise, an AI-powered GMAT voice tutor.

Your role is to analyze GMAT tutoring conversations and extract key learning information to build the student's long-term learner profile. This profile helps the tutor remember the student's strengths, weaknesses, and preferred learning style across sessions.

## What to extract:

**weak_topics**: Topics where the learner struggled THIS session
- Questions they got wrong or needed heavy guidance on
- Concepts they couldn't explain back
- Areas where they showed confusion or frustration
- Only NEW weak topics not already known
- Examples: "quadratic equations", "critical reasoning assumptions", "table analysis growth rates"

**strong_topics**: Topics where the learner excelled THIS session
- Questions answered correctly and quickly
- Concepts they could explain or teach back
- Areas where they showed confidence and accuracy
- Examples: "fraction arithmetic", "sentence correction parallelism"

**effective_techniques**: What explanation approaches worked
- Did visual/diagram explanations help?
- Did step-by-step walkthroughs land?
- Did real-world analogies connect?
- Did practice-first-then-explain work better than explain-first?
- Examples: ["step-by-step walkthrough for DS problems", "real-life analogy for probability", "elimination strategy for SC"]

**ineffective_approaches**: What did NOT work
- Techniques the learner rejected or didn't engage with
- Explanations that fell flat or confused them more
- Moments where they said "I already know that" or "that doesn't help"
- Examples: ["formula-heavy explanation for geometry", "abstract explanation without examples"]

**insight_moments**: "Aha" moments
- Phrases or analogies that clearly resonated ("oh THAT'S how it works!")
- Ideas they repeated back in their own words (sign of internalization)
- Concepts that visibly "clicked"
- Examples: ["'treat DS like a yes/no question' clicked", "'probability is just counting favorable outcomes' landed"]

**concept_links**: Connections between topics discovered this session
- Links the learner made between different GMAT areas
- Patterns that emerged across topics
- Format: {"algebra": ["word problems", "data sufficiency"], "percentages": ["profit/loss", "growth rates"]}
- Only connections made IN THIS SESSION

**learning_style**: How this learner learns best (updated observation)
- Do they prefer examples first or theory first?
- Do they learn by doing (practice) or by watching (demonstration)?
- Do they prefer visual, verbal, or step-by-step?
- Examples: "Learns best through worked examples before theory. Prefers to attempt problems first, then get guided correction."

**explanation_preference**: What kind of teaching style they respond to
- Do they want Socratic questioning (guided discovery)?
- Do they want direct explanations?
- Do they want to be challenged with harder problems?
- Set to null if no clear pattern

**session_topics**: Main GMAT topics covered (2-5 topic labels)
- What did the session primarily cover?
- Examples: ["data sufficiency", "algebra — quadratics", "timing strategy"]

**next_session_plan**: What to work on next session
- Based on weak areas exposed this session
- Natural progression from current topics
- Set to null if no specific recommendation

**score_trajectory**: Accuracy trend observation
- Did they improve during this session?
- Are they getting harder problems right?
- Comparison to previous performance if known
- Set to null if insufficient data

**time_pressure_notes**: How they handle time constraints
- Do they rush and make careless errors?
- Do they spend too long on hard problems?
- Do they skip/guess appropriately?
- Set to null if time wasn't discussed

**common_error_patterns**: Recurring mistake types
- Not just "got it wrong" — WHY they got it wrong
- Examples: ["misreads DS question stem", "forgets to test negative numbers", "rushes SC without reading all choices", "confuses 'percent of' vs 'percent more than'"]

## Guidelines:

- Be specific, not generic. "Struggled with algebra" is bad. "Struggled with quadratic factoring when leading coefficient ≠ 1" is good.
- Focus on patterns, not one-off mistakes
- Only extract NEW information not already in their profile
- Prioritize actionable observations the tutor can use next session
- Keep it concise — quality over quantity`
}

function buildExistingProfileContext(profile: GmatLearnerProfile): string {
  const parts: string[] = []
  parts.push('## Existing learner profile (DO NOT repeat this information):')

  if (profile.weakTopics.length > 0) {
    parts.push(`Known weak topics: ${profile.weakTopics.join(', ')}`)
  }
  if (profile.strongTopics.length > 0) {
    parts.push(`Known strong topics: ${profile.strongTopics.join(', ')}`)
  }
  if (profile.effectiveTechniques.length > 0) {
    parts.push(`What works: ${profile.effectiveTechniques.join(', ')}`)
  }
  if (profile.ineffectiveApproaches.length > 0) {
    parts.push(`What doesn't work: ${profile.ineffectiveApproaches.join(', ')}`)
  }
  if (profile.commonErrorPatterns.length > 0) {
    parts.push(`Known error patterns: ${profile.commonErrorPatterns.join(', ')}`)
  }
  if (profile.learningStyle) {
    parts.push(`Learning style: ${profile.learningStyle}`)
  }
  if (profile.targetScore) {
    parts.push(`Target score: ${profile.targetScore}`)
  }
  if (profile.scoreTrajectory) {
    parts.push(`Score trajectory: ${profile.scoreTrajectory}`)
  }

  return parts.length > 1 ? parts.join('\n') : ''
}

/**
 * Merge Memory Agent extraction results with existing learner profile.
 * NEVER overwrites — only adds new information and updates trends.
 */
export function mergeGmatProfile(
  extraction: GmatMemoryExtractionResult,
  existingProfile: GmatLearnerProfile | null
): GmatLearnerProfile {
  const base: GmatLearnerProfile = existingProfile || {
    weakTopics: [],
    strongTopics: [],
    effectiveTechniques: [],
    ineffectiveApproaches: [],
    insightMoments: [],
    conceptLinks: {},
    learningStyle: '',
    explanationPreference: null,
    sessionTopics: [],
    nextSessionPlan: null,
    scoreTrajectory: null,
    timePressureNotes: null,
    commonErrorPatterns: [],
    targetScore: null,
    currentEstimatedScore: null,
    studyHoursPerWeek: null,
    testDate: null,
    preferredDifficulty: null,
  }

  // Merge weak topics — add new, keep existing
  // If a topic appears in strong_topics this session, remove from weak_topics (progression!)
  const newWeakTopics = [...new Set([...base.weakTopics, ...extraction.weak_topics])]
  const updatedWeakTopics = newWeakTopics.filter(
    topic => !extraction.strong_topics.includes(topic) // Remove if now strong
  )

  // Merge strong topics
  const updatedStrongTopics = [...new Set([...base.strongTopics, ...extraction.strong_topics])]

  // Merge techniques
  const updatedEffective = [...new Set([...base.effectiveTechniques, ...extraction.effective_techniques])]
  const updatedIneffective = [...new Set([...base.ineffectiveApproaches, ...extraction.ineffective_approaches])]

  // Merge insight moments (keep last 20 max)
  const updatedInsights = [...new Set([...base.insightMoments, ...extraction.insight_moments])].slice(-20)

  // Merge concept links
  const updatedLinks = { ...base.conceptLinks }
  for (const [topic, connections] of Object.entries(extraction.concept_links)) {
    if (updatedLinks[topic]) {
      updatedLinks[topic] = [...new Set([...updatedLinks[topic], ...connections])]
    } else {
      updatedLinks[topic] = connections
    }
  }

  // Merge session topics (keep last 50)
  const updatedSessionTopics = [...base.sessionTopics, ...extraction.session_topics].slice(-50)

  // Merge error patterns
  const updatedErrorPatterns = [...new Set([...base.commonErrorPatterns, ...extraction.common_error_patterns])]

  // Update learning style (latest observation wins, append to existing)
  const updatedLearningStyle = extraction.learning_style
    ? extraction.learning_style
    : base.learningStyle

  return {
    ...base,
    weakTopics: updatedWeakTopics,
    strongTopics: updatedStrongTopics,
    effectiveTechniques: updatedEffective,
    ineffectiveApproaches: updatedIneffective,
    insightMoments: updatedInsights,
    conceptLinks: updatedLinks,
    learningStyle: updatedLearningStyle,
    explanationPreference: extraction.explanation_preference || base.explanationPreference,
    sessionTopics: updatedSessionTopics,
    nextSessionPlan: extraction.next_session_plan || base.nextSessionPlan,
    scoreTrajectory: extraction.score_trajectory || base.scoreTrajectory,
    timePressureNotes: extraction.time_pressure_notes || base.timePressureNotes,
    commonErrorPatterns: updatedErrorPatterns,
  }
}
