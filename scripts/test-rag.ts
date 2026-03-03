#!/usr/bin/env node
/**
 * Confide — RAG Knowledge Base Testing Script
 *
 * Тестирует качество и покрытие RAG базы знаний
 *
 * Usage:
 *   npx tsx scripts/test-rag.ts
 */

// IMPORTANT: Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { retrieveContext } from '../lib/pinecone/retrieval'
import { NAMESPACES, type Namespace } from '../lib/pinecone/client'

// Минимальный relevance score для прохождения теста
// Semantic search обычно дает scores 0.5-0.8, поэтому 0.55 — реалистичный порог
const MIN_RELEVANCE_SCORE = 0.55

interface TestQuery {
  query: string
  expectedNamespace: Namespace
  expectedAuthors: string[]
  category: string
}

// Набор тестовых запросов
const testQueries: TestQuery[] = [
  // ANXIETY
  {
    query: 'I feel anxious and my heart is racing',
    expectedNamespace: NAMESPACES.ANXIETY_CBT,
    expectedAuthors: ['David Burns', 'Russ Harris', 'Matthew McKay', 'Edmund Bourne'],
    category: 'Anxiety',
  },
  {
    query: 'I have panic attacks and feel like I cannot breathe',
    expectedNamespace: NAMESPACES.ANXIETY_CBT,
    expectedAuthors: ['David Burns', 'Edmund Bourne'],
    category: 'Anxiety',
  },
  {
    query: "I have OCD intrusive thoughts that won't go away",
    expectedNamespace: NAMESPACES.ANXIETY_CBT,
    expectedAuthors: ['Jeffrey Schwartz', 'Matthew McKay'],
    category: 'OCD',
  },
  {
    query: 'I worry constantly about everything',
    expectedNamespace: NAMESPACES.ANXIETY_CBT,
    expectedAuthors: ['David Burns', 'Matthew McKay', 'Russ Harris'],
    category: 'Anxiety',
  },

  // TRAUMA
  {
    query: 'I experienced childhood trauma and it still affects me',
    expectedNamespace: NAMESPACES.TRAUMA,
    expectedAuthors: ['Bessel van der Kolk', 'Judith Herman'],
    category: 'Trauma',
  },
  {
    query: 'I have PTSD from a traumatic event',
    expectedNamespace: NAMESPACES.TRAUMA,
    expectedAuthors: ['Bessel van der Kolk', 'Judith Herman'],
    category: 'Trauma',
  },
  {
    query: 'I was abused as a child and struggle to trust people',
    expectedNamespace: NAMESPACES.TRAUMA,
    expectedAuthors: ['Judith Herman', 'Bessel van der Kolk'],
    category: 'Trauma',
  },

  // FAMILY & RELATIONSHIPS
  {
    query: 'My relationship is falling apart and we fight constantly',
    expectedNamespace: NAMESPACES.FAMILY,
    expectedAuthors: ['John Gottman', 'Sue Johnson', 'Amir Levine'],
    category: 'Relationships',
  },
  {
    query: 'My partner and I have communication problems',
    expectedNamespace: NAMESPACES.FAMILY,
    expectedAuthors: ['John Gottman', 'Sue Johnson'],
    category: 'Relationships',
  },
  {
    query: 'My marriage is in crisis',
    expectedNamespace: NAMESPACES.FAMILY,
    expectedAuthors: ['John Gottman', 'Sue Johnson'],
    category: 'Relationships',
  },
  {
    query: 'I have problems with my parents and family',
    expectedNamespace: NAMESPACES.FAMILY,
    expectedAuthors: ['Lindsay Gibson'], // Virginia Satir нет в базе
    category: 'Family',
  },

  // GENERAL
  {
    query: 'I feel worthless and have low self-esteem',
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: ['Nathaniel Branden', 'Carl Rogers', 'Kristin Neff'],
    category: 'Self-esteem',
  },
  {
    query: 'I feel like my life has no meaning',
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: ['Viktor Frankl', 'Irvin Yalom'],
    category: 'Meaning',
  },
  {
    query: 'I am lonely and isolated',
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: ['Carl Rogers', 'Irvin Yalom', 'Johann Hari'],
    category: 'Loneliness',
  },

  // Previously GAP topics — now with coverage
  {
    query: 'I struggle with alcohol addiction',
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: ['Gabor Maté'],
    category: 'Addiction',
  },
  {
    query: "My child has ADHD and I don't know how to help",
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: ['Gabor Maté'], // Scattered Minds covers ADHD
    category: 'Parenting',
  },
  {
    query: 'I have an eating disorder and binge eat',
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: ['Evelyn Tribole'],
    category: 'Eating Disorders',
  },
  {
    query: 'I am struggling with grief after losing someone',
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: ['Elisabeth Kübler-Ross'],
    category: 'Grief',
  },
  {
    query: 'I have bipolar disorder',
    expectedNamespace: NAMESPACES.GENERAL,
    expectedAuthors: [], // Still a GAP — need bipolar book
    category: 'Bipolar',
  },
]

interface TestResult {
  query: string
  category: string
  status: 'PASS' | 'FAIL' | 'GAP'
  relevanceScore: number
  foundAuthors: string[]
  expectedAuthors: string[]
  missingAuthors: string[]
  namespace: string
  details: string
}

/**
 * Запустить один тест
 */
async function runTest(testQuery: TestQuery): Promise<TestResult> {
  const { query, expectedNamespace, expectedAuthors, category } = testQuery

  // Получить контекст из RAG
  const chunks = await retrieveContext(query, expectedNamespace, 5)

  // Если нет результатов — FAIL
  if (chunks.length === 0) {
    return {
      query,
      category,
      status: 'FAIL',
      relevanceScore: 0,
      foundAuthors: [],
      expectedAuthors,
      missingAuthors: expectedAuthors,
      namespace: expectedNamespace,
      details: 'No chunks retrieved',
    }
  }

  // Лучший relevance score
  const topScore = chunks[0].score

  // Найденные авторы
  const foundAuthors = Array.from(new Set(chunks.map((c) => c.metadata.author)))

  // Недостающие авторы
  const missingAuthors = expectedAuthors.filter((author) => !foundAuthors.includes(author))

  // Определить статус
  let status: 'PASS' | 'FAIL' | 'GAP'

  // Если ожидали пробел (expectedAuthors пустой) и score низкий — это GAP
  if (expectedAuthors.length === 0) {
    status = 'GAP'
  }
  // Если score слишком низкий — FAIL
  else if (topScore < MIN_RELEVANCE_SCORE) {
    status = 'FAIL'
  }
  // Если нашли всех ожидаемых авторов — PASS
  else if (missingAuthors.length === 0) {
    status = 'PASS'
  }
  // Если нашли хотя бы одного автора — PASS (частичное покрытие)
  else if (foundAuthors.some((author) => expectedAuthors.includes(author))) {
    status = 'PASS'
  }
  // Иначе FAIL
  else {
    status = 'FAIL'
  }

  return {
    query,
    category,
    status,
    relevanceScore: topScore,
    foundAuthors,
    expectedAuthors,
    missingAuthors,
    namespace: expectedNamespace,
    details: chunks.length > 0 ? `${chunks.length} chunks, top: ${chunks[0].metadata.book_title}` : '',
  }
}

/**
 * Форматировать результат теста для консоли
 */
function formatResult(result: TestResult): string {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'GAP' ? '⚠️ ' : '❌'
  const score = result.relevanceScore.toFixed(3)

  let output = `${icon} ${result.status.padEnd(4)} | Score: ${score} | ${result.category.padEnd(18)} | ${result.query.substring(0, 50)}`

  if (result.status === 'GAP') {
    output += `\n        → Coverage gap detected`
  } else if (result.status === 'FAIL') {
    output += `\n        → Failed: ${result.details}`
    if (result.missingAuthors.length > 0) {
      output += `\n        → Missing authors: ${result.missingAuthors.join(', ')}`
    }
  } else if (result.missingAuthors.length > 0) {
    output += `\n        → Partial coverage (missing: ${result.missingAuthors.join(', ')})`
  }

  if (result.foundAuthors.length > 0 && result.status !== 'GAP') {
    output += `\n        → Found: ${result.foundAuthors.join(', ')}`
  }

  return output
}

/**
 * Генерировать рекомендации по пробелам
 */
function generateRecommendations(results: TestResult[]): string[] {
  const recommendations: string[] = []

  const gapsByCategory = results
    .filter((r) => r.status === 'GAP')
    .reduce(
      (acc, r) => {
        if (!acc[r.category]) {
          acc[r.category] = []
        }
        acc[r.category].push(r.query)
        return acc
      },
      {} as Record<string, string[]>
    )

  // Addiction
  if (gapsByCategory['Addiction']) {
    recommendations.push('📚 Addiction: "The Biology of Desire" by Marc Lewis')
    recommendations.push('📚 Addiction: "In the Realm of Hungry Ghosts" by Gabor Maté')
  }

  // Parenting
  if (gapsByCategory['Parenting']) {
    recommendations.push('📚 Parenting/ADHD: "Driven to Distraction" by Edward Hallowell')
    recommendations.push('📚 Parenting: "The Whole-Brain Child" by Daniel Siegel')
  }

  // Eating Disorders
  if (gapsByCategory['Eating Disorders']) {
    recommendations.push('📚 Eating Disorders: "Intuitive Eating" by Evelyn Tribole')
    recommendations.push('📚 Eating Disorders: "The Body Keeps the Score" (trauma aspect)')
  }

  // Grief
  if (gapsByCategory['Grief']) {
    recommendations.push('📚 Grief: "On Grief and Grieving" by Elisabeth Kübler-Ross')
    recommendations.push('📚 Grief: "The Year of Magical Thinking" by Joan Didion')
  }

  // Bipolar
  if (gapsByCategory['Bipolar']) {
    recommendations.push('📚 Bipolar: "An Unquiet Mind" by Kay Redfield Jamison')
    recommendations.push('📚 Bipolar: "The Bipolar Disorder Survival Guide" by David Miklowitz')
  }

  return recommendations
}

/**
 * Основная функция тестирования
 */
async function testRAG() {
  console.log('🧪 Confide RAG Knowledge Base Testing\n')
  console.log(`Testing ${testQueries.length} queries...\n`)

  const results: TestResult[] = []

  // Запустить все тесты
  for (const testQuery of testQueries) {
    const result = await runTest(testQuery)
    results.push(result)
    console.log(formatResult(result))
    console.log()
  }

  // Статистика
  console.log('━'.repeat(80))
  console.log('\n📊 SUMMARY\n')

  const passed = results.filter((r) => r.status === 'PASS').length
  const failed = results.filter((r) => r.status === 'FAIL').length
  const gaps = results.filter((r) => r.status === 'GAP').length

  const passRate = ((passed / testQueries.length) * 100).toFixed(1)
  const coverageRate = (((passed + failed) / testQueries.length) * 100).toFixed(1)

  console.log(`✅ PASSED:  ${passed}/${testQueries.length} (${passRate}%)`)
  console.log(`❌ FAILED:  ${failed}/${testQueries.length}`)
  console.log(`⚠️  GAPS:    ${gaps}/${testQueries.length}`)
  console.log(`📈 Coverage: ${coverageRate}% (topics with any content)`)
  console.log()

  // Средний relevance score
  const avgScore =
    results.filter((r) => r.status !== 'GAP').reduce((sum, r) => sum + r.relevanceScore, 0) /
    results.filter((r) => r.status !== 'GAP').length
  console.log(`📊 Average relevance score: ${avgScore.toFixed(3)}`)
  console.log()

  // Gaps по категориям
  if (gaps > 0) {
    console.log('━'.repeat(80))
    console.log('\n⚠️  COVERAGE GAPS\n')

    const gapsByCategory = results
      .filter((r) => r.status === 'GAP')
      .reduce(
        (acc, r) => {
          if (!acc[r.category]) {
            acc[r.category] = 0
          }
          acc[r.category]++
          return acc
        },
        {} as Record<string, number>
      )

    Object.entries(gapsByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} queries`)
      })

    console.log()

    // Рекомендации
    console.log('━'.repeat(80))
    console.log('\n💡 RECOMMENDATIONS\n')
    console.log('Add these books to improve coverage:\n')

    const recommendations = generateRecommendations(results)
    recommendations.forEach((rec) => console.log(`   ${rec}`))
    console.log()
  }

  // Failed tests
  if (failed > 0) {
    console.log('━'.repeat(80))
    console.log('\n❌ FAILED TESTS (need better sources)\n')

    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`   ${r.category}: "${r.query.substring(0, 60)}..."`)
        console.log(`      Score: ${r.relevanceScore.toFixed(3)} (need > ${MIN_RELEVANCE_SCORE})`)
        if (r.missingAuthors.length > 0) {
          console.log(`      Missing: ${r.missingAuthors.join(', ')}`)
        }
        console.log()
      })
  }

  console.log('━'.repeat(80))
  console.log('\n✨ Testing complete!\n')
}

// Запуск
testRAG().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
