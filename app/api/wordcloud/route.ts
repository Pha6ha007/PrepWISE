// app/api/wordcloud/route.ts
// Word cloud API - Top words/themes from user messages

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Stop words to exclude from word cloud
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
  'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
  'don', 'should', 'now', 'like', 'feel', 'feeling', 'think', 'know', 'im', 'ive', 'dont',
  'cant', 'wont', 'didnt', 'doesnt', 'isnt', 'arent', 'wasnt', 'werent', 'havent', 'hasnt',
  'hadnt', 'wouldnt', 'shouldnt', 'couldnt', 'youre', 'hes', 'shes', 'its', 'were', 'theyre',
  'ive', 'youve', 'weve', 'theyve', 'id', 'youd', 'hed', 'shed', 'wed', 'theyd', 'ill',
  'youll', 'hell', 'shell', 'well', 'theyll',
])

// GET /api/wordcloud - Get top words from user messages
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '15', 10)

    // Fetch user messages (excluding assistant messages)
    const messages = await prisma.message.findMany({
      where: {
        userId: user.id,
        role: 'user',
      },
      select: {
        content: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Analyze last 100 messages for performance
      take: 100,
    })

    // Word frequency analysis
    const wordCounts = new Map<string, number>()

    messages.forEach((message) => {
      // Tokenize: lowercase, remove punctuation, split
      const words = message.content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word) => {
          return (
            word.length > 3 && // Min 4 characters
            !STOP_WORDS.has(word) &&
            !/^\d+$/.test(word) // Not a number
          )
        })

      words.forEach((word) => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
      })
    })

    // Convert to array and sort by count
    const topWords = Array.from(wordCounts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return NextResponse.json({ words: topWords })
  } catch (error) {
    console.error('Error generating word cloud:', error)
    return NextResponse.json({ error: 'Failed to generate word cloud' }, { status: 500 })
  }
}
