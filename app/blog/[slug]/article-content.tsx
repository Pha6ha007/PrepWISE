'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Brain, Clock, ArrowLeft, ArrowRight, User } from 'lucide-react'
import type { BlogArticle } from '@/lib/blog/articles'
import { SECTION_LABELS, SECTION_COLORS } from '@/lib/blog/articles'

interface Heading {
  id: string
  text: string
  level: number
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const text = match[2].replace(/\*\*/g, '')
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      headings.push({ id, text, level: match[1].length })
    }
  }
  return headings
}

function renderMarkdown(content: string): string {
  return content
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      // Headings
      const h2Match = trimmed.match(/^## (.+)$/)
      if (h2Match) {
        const text = h2Match[1].replace(/\*\*/g, '')
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        return `<h2 id="${id}" class="text-2xl font-bold mt-12 mb-4 text-white scroll-mt-24">${renderInline(h2Match[1])}</h2>`
      }
      const h3Match = trimmed.match(/^### (.+)$/)
      if (h3Match) {
        const text = h3Match[1].replace(/\*\*/g, '')
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        return `<h3 id="${id}" class="text-xl font-semibold mt-8 mb-3 text-white scroll-mt-24">${renderInline(h3Match[1])}</h3>`
      }

      // Table
      if (trimmed.includes('|') && trimmed.includes('---')) {
        const rows = trimmed.split('\n').filter((r) => !r.match(/^\|[\s-|]+\|$/))
        if (rows.length >= 1) {
          const headerCells = rows[0].split('|').filter(Boolean).map((c) => c.trim())
          const bodyRows = rows.slice(1)
          let html = '<div class="overflow-x-auto my-6"><table class="w-full text-sm border-collapse">'
          html += '<thead><tr>'
          for (const cell of headerCells) {
            html += `<th class="text-left px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 font-medium">${renderInline(cell)}</th>`
          }
          html += '</tr></thead><tbody>'
          for (const row of bodyRows) {
            const cells = row.split('|').filter(Boolean).map((c) => c.trim())
            html += '<tr>'
            for (const cell of cells) {
              html += `<td class="px-4 py-2.5 border border-white/10 text-slate-400">${renderInline(cell)}</td>`
            }
            html += '</tr>'
          }
          html += '</tbody></table></div>'
          return html
        }
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const quoteContent = trimmed
          .split('\n')
          .map((l) => l.replace(/^>\s?/, ''))
          .join('<br/>')
        return `<blockquote class="border-l-2 border-cyan-500/40 pl-4 my-6 text-slate-400 italic">${renderInline(quoteContent)}</blockquote>`
      }

      // Unordered list
      if (trimmed.match(/^[-*]\s/m)) {
        const items = trimmed.split('\n').filter((l) => l.match(/^[-*]\s/))
        const lis = items
          .map((item) => {
            const text = item.replace(/^[-*]\s+/, '')
            return `<li class="text-slate-300 leading-relaxed">${renderInline(text)}</li>`
          })
          .join('')
        return `<ul class="list-disc list-outside pl-5 my-4 space-y-1.5">${lis}</ul>`
      }

      // Ordered list
      if (trimmed.match(/^\d+\.\s/m)) {
        const items = trimmed.split('\n').filter((l) => l.match(/^\d+\.\s/))
        const lis = items
          .map((item) => {
            const text = item.replace(/^\d+\.\s+/, '')
            return `<li class="text-slate-300 leading-relaxed">${renderInline(text)}</li>`
          })
          .join('')
        return `<ol class="list-decimal list-outside pl-5 my-4 space-y-1.5">${lis}</ol>`
      }

      // Paragraph
      return `<p class="text-slate-300 leading-relaxed my-4">${renderInline(trimmed)}</p>`
    })
    .join('')
}

function renderInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 text-sm">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br/>')
}

interface ArticleContentProps {
  article: BlogArticle
  related: BlogArticle[]
  sectionLabel: string
  sectionColor: string
}

export function ArticleContent({ article, related, sectionLabel, sectionColor }: ArticleContentProps) {
  const headings = useMemo(() => extractHeadings(article.content), [article.content])
  const html = useMemo(() => renderMarkdown(article.content), [article.content])

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
            <Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="flex gap-12">
          {/* Main content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            {/* Article header */}
            <div className="mb-8">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${sectionColor} mb-4`}>
                {sectionLabel}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
              <p className="text-lg text-slate-400 mb-6">{article.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {article.readingTime} min read
                </span>
                <span>
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Article body */}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* CTA */}
            <div className="mt-16 p-8 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl text-center">
              <h3 className="text-xl font-bold mb-2">Ready to put these strategies into practice?</h3>
              <p className="text-slate-400 mb-6">
                Talk to Sam — your AI GMAT tutor who remembers your weak spots and adapts every session.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-[#0A0F1E] font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Try PrepWISE Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-white/[0.06]">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar — Table of Contents */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Contents
                </h4>
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`block text-sm hover:text-cyan-400 transition-colors ${
                        heading.level === 2
                          ? 'text-slate-400 py-1'
                          : 'text-slate-500 pl-4 py-0.5 text-xs'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>

                {/* Sidebar CTA */}
                <div className="mt-8 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <p className="text-sm text-slate-400 mb-3">Get personalized GMAT prep with AI</p>
                  <Link
                    href="/register"
                    className="block text-center text-sm bg-gradient-to-r from-cyan-500 to-cyan-600 text-[#0A0F1E] font-semibold px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-cyan-500 transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="border-t border-white/[0.06] mt-16">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className={`h-1 w-full ${
                    r.section === 'quant' ? 'bg-blue-500' :
                    r.section === 'verbal' ? 'bg-purple-500' :
                    r.section === 'data-insights' ? 'bg-emerald-500' :
                    r.section === 'strategy' ? 'bg-amber-500' :
                    'bg-cyan-500'
                  }`} />
                  <div className="p-5">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${SECTION_COLORS[r.section]} mb-3`}>
                      {SECTION_LABELS[r.section]}
                    </span>
                    <h3 className="font-semibold mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                      {r.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{r.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {r.readingTime} min read
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
