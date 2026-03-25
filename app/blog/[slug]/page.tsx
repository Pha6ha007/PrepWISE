import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles, SECTION_LABELS, SECTION_COLORS } from '@/lib/blog/articles'
import { ArticleContent } from './article-content'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  return {
    title: `${article.title} | PrepWISE Blog`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const related = getRelatedArticles(slug, 3)

  return (
    <ArticleContent
      article={article}
      related={related}
      sectionLabel={SECTION_LABELS[article.section]}
      sectionColor={SECTION_COLORS[article.section]}
    />
  )
}
