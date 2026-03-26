import Link from 'next/link'
import { ArrowRight, BookOpen, Star, Sparkles, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recommended GMAT Resources | PrepWISE',
  description: 'The best GMAT preparation books and resources, hand-picked by PrepWISE. Official guides, strategy books, and budget-friendly options.',
}

type Badge = 'Essential' | 'Recommended' | 'Optional'

interface BookItem {
  title: string
  author: string
  price: string
  badge: Badge
  description: string
  amazonQuery: string
}

const essentialBooks: BookItem[] = [
  {
    title: 'GMAT Official Guide 2025–2026',
    author: 'GMAC (Graduate Management Admission Council)',
    price: '~$45',
    badge: 'Essential',
    description:
      'The definitive GMAT prep resource with 900+ real questions from past exams. Covers all sections with detailed answer explanations. This is the single most important book for any GMAT student.',
    amazonQuery: 'GMAT+Official+Guide+2025+2026',
  },
  {
    title: 'GMAT Official Quantitative Review',
    author: 'GMAC',
    price: '~$25',
    badge: 'Essential',
    description:
      'Deep dive into Quant with 300+ additional practice problems. Excellent for building fluency in Problem Solving and Data Sufficiency before tackling full-length practice tests.',
    amazonQuery: 'GMAT+Official+Quantitative+Review',
  },
  {
    title: 'GMAT Official Verbal Review',
    author: 'GMAC',
    price: '~$25',
    badge: 'Essential',
    description:
      'Extra Verbal practice covering Reading Comprehension, Critical Reasoning, and Sentence Correction. The official questions are the best proxy for the real test.',
    amazonQuery: 'GMAT+Official+Verbal+Review',
  },
  {
    title: 'GMAT Official Data Insights Review',
    author: 'GMAC',
    price: '~$25',
    badge: 'Essential',
    description:
      'Focused practice for the newer Data Insights section, including Multi-Source Reasoning and Graphics Interpretation. Critical for the updated GMAT Focus Edition.',
    amazonQuery: 'GMAT+Official+Data+Insights+Review',
  },
]

const strategyGuides: BookItem[] = [
  {
    title: 'Manhattan Prep GMAT All the Quant',
    author: 'Manhattan Prep',
    price: '~$30',
    badge: 'Recommended',
    description:
      'Comprehensive Quant strategy guide covering number properties, algebra, word problems, and geometry. Great for building conceptual foundations alongside official practice material.',
    amazonQuery: 'Manhattan+Prep+GMAT+All+the+Quant',
  },
  {
    title: 'Manhattan Prep GMAT All the Verbal',
    author: 'Manhattan Prep',
    price: '~$30',
    badge: 'Recommended',
    description:
      'Breaks down every Verbal question type with clear strategies and drills. Especially strong on Sentence Correction rules and Critical Reasoning argument structures.',
    amazonQuery: 'Manhattan+Prep+GMAT+All+the+Verbal',
  },
]

const budgetOptions: BookItem[] = [
  {
    title: 'Magoosh GMAT Prep',
    author: 'Magoosh (Online Platform)',
    price: '~$29/mo',
    badge: 'Optional',
    description:
      'Affordable online platform with video lessons, practice questions, and score predictions. A solid budget option for supplementing your book study with interactive practice.',
    amazonQuery: 'Magoosh+GMAT+Prep',
  },
  {
    title: 'GMAT Club Math Book',
    author: 'GMAT Club Community',
    price: 'Free PDF',
    badge: 'Optional',
    description:
      'Community-created math reference covering all Quant fundamentals tested on the GMAT. Perfect as a quick-reference companion when you encounter unfamiliar concepts during practice.',
    amazonQuery: 'GMAT+Club+Math+Book',
  },
]

const badgeStyles: Record<Badge, string> = {
  Essential: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Recommended: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Optional: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

function BookCard({ book }: { book: BookItem }) {
  return (
    <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-4 hover:border-white/[0.10] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white mb-1 leading-snug">{book.title}</h3>
          <p className="text-xs text-slate-500">{book.author}</p>
        </div>
        <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeStyles[book.badge]}`}>
          {book.badge}
        </span>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed flex-1">{book.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
        <span className="text-sm font-semibold text-white">{book.price}</span>
        <a
          href={`https://amazon.com/s?k=${book.amazonQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          View on Amazon <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">🧠 PrepWISE</Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/register"
              className="text-sm bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start for free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Curated by PrepWISE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Recommended GMAT Resources
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            The books and tools that top scorers actually use. Each resource is hand-picked based on student results.
          </p>
        </div>

        {/* Essential Books */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Essential Books</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {essentialBooks.map((book) => (
              <BookCard key={book.title} book={book} />
            ))}
          </div>
        </section>

        {/* Strategy Guides */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Strategy Guides</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {strategyGuides.map((book) => (
              <BookCard key={book.title} book={book} />
            ))}
          </div>
        </section>

        {/* Budget Options */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Budget Options</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {budgetOptions.map((book) => (
              <BookCard key={book.title} book={book} />
            ))}
          </div>
        </section>

        {/* Why PrepWISE + Books */}
        <section className="bg-gradient-to-br from-cyan-500/10 to-violet-500/5 border border-cyan-500/10 rounded-2xl p-8 md:p-10 mb-14">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Why PrepWISE + Books?</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Books give you the content. PrepWISE gives you the tutor. Use both for the fastest score improvement.
            </p>
            <p className="text-sm text-slate-500">
              Study the theory from official guides, then practice with Sam — your AI tutor who remembers your weak spots and adapts every session.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-500 mt-3">7-day free trial · No credit card required</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 PrepWISE. AI-Powered GMAT Tutor.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <Link href="/guarantee" className="hover:text-slate-300 transition-colors">Guarantee</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
