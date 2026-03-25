'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Clock, ArrowRight, Search } from 'lucide-react'
import { BLOG_ARTICLES, SECTION_LABELS, SECTION_COLORS, type BlogArticle } from '@/lib/blog/articles'

const ALL_SECTIONS: Array<BlogArticle['section'] | 'all'> = ['all', 'quant', 'verbal', 'data-insights', 'strategy', 'general']

export default function BlogPage() {
  const [activeSection, setActiveSection] = useState<BlogArticle['section'] | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = BLOG_ARTICLES.filter((a) => {
    const matchesSection = activeSection === 'all' || a.section === activeSection
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSection && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] backdrop-blur-sm sticky top-0 z-50 bg-[#0A0F1E]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-[#0A0F1E]" />
            </div>
            <span className="text-lg font-bold tracking-tight">Prepwise</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-cyan-400 font-medium px-3 py-2">
              Blog
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/register" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-sm font-semibold text-[#0A0F1E] px-5 py-2.5 rounded-lg transition-all">
              Try 7 days free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            GMAT Prep <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Expert strategies, study plans, and section-by-section guides to help you score 700+ on the GMAT Focus Edition.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === section
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-slate-300'
              }`}
            >
              {section === 'all' ? 'All' : SECTION_LABELS[section]}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No articles found.</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
              >
                {/* Color band */}
                <div className={`h-1 w-full ${
                  article.section === 'quant' ? 'bg-blue-500' :
                  article.section === 'verbal' ? 'bg-purple-500' :
                  article.section === 'data-insights' ? 'bg-emerald-500' :
                  article.section === 'strategy' ? 'bg-amber-500' :
                  'bg-cyan-500'
                }`} />

                <div className="p-6">
                  {/* Section badge */}
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${SECTION_COLORS[article.section]} mb-4`}>
                    {SECTION_LABELS[article.section]}
                  </span>

                  <h2 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {article.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readingTime} min read
                      </span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start your GMAT prep?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Talk to Sam — your AI GMAT tutor who adapts to your level, remembers your weak spots, and helps you score 700+.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-[#0A0F1E] font-semibold px-6 py-3 rounded-lg transition-all">
            Try PrepWISE Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <span>© {new Date().getFullYear()} PrepWISE. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
