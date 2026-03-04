import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const books = await prisma.knowledgeBase.groupBy({
    by: ['sourceTitle', 'author'],
    _count: { id: true }
  })
  
  console.log('📚 Books loaded in Pinecone:\n')
  books.forEach(book => {
    console.log(`✓ ${book.sourceTitle} — ${book.author} (${book._count.id} chunks)`)
  })
  console.log(`\nTotal: ${books.length} unique books`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error)
