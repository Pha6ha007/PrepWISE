import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const booksDir = path.join(process.cwd(), 'books')

interface BookInfo {
  filename: string
  sizeMB: number
  pages: number | null
}

function getBookInfo(filename: string): BookInfo {
  const filepath = path.join(booksDir, filename)
  const stats = fs.statSync(filepath)
  const sizeMB = parseFloat((stats.size / (1024 * 1024)).toFixed(2))

  // Try to get page count using mdls (macOS)
  let pages: number | null = null
  try {
    const output = execSync(`mdls -name kMDItemNumberOfPages "${filepath}"`, { encoding: 'utf-8' })
    const match = output.match(/kMDItemNumberOfPages\s*=\s*(\d+)/)
    if (match) {
      pages = parseInt(match[1])
    }
  } catch (error) {
    // If mdls fails, pages will remain null
  }

  return { filename, sizeMB, pages }
}

function main() {
  const files = fs.readdirSync(booksDir).filter(f => f.endsWith('.pdf'))
  const books = files.map(getBookInfo).sort((a, b) => a.filename.localeCompare(b.filename))

  console.log('📚 PDF Files Analysis\n')
  console.log('─'.repeat(100))
  console.log(sprintf('%-70s %10s %10s', 'Filename', 'Size (MB)', 'Pages'))
  console.log('─'.repeat(100))

  books.forEach(book => {
    const pagesStr = book.pages !== null ? book.pages.toString() : 'N/A'
    console.log(sprintf('%-70s %10.2f %10s', book.filename, book.sizeMB, pagesStr))
  })

  console.log('─'.repeat(100))
  console.log(`\nTotal: ${books.length} PDF files`)

  // Detect duplicates
  console.log('\n🔍 Potential Duplicates:\n')

  const duplicates = [
    {
      title: 'The Body Keeps the Score',
      files: books.filter(b =>
        b.filename.includes('Body Keeps the Score') ||
        b.filename.includes('body-keeps-score')
      )
    },
    {
      title: 'No More Mr. Nice Guy',
      files: books.filter(b => b.filename.toLowerCase().includes('no more mr'))
    },
    {
      title: "I Don't Want to Talk About It",
      files: books.filter(b => b.filename.toLowerCase().includes('dont-want-to-talk') ||
        b.filename.includes('I Don\'t Want to Talk'))
    },
    {
      title: 'The Will to Change',
      files: books.filter(b => b.filename.includes('Will to Change'))
    },
    {
      title: 'DBT Skills',
      files: books.filter(b => b.filename.toLowerCase().includes('dbt'))
    }
  ]

  duplicates.forEach(dup => {
    if (dup.files.length > 1) {
      console.log(`📖 ${dup.title}:`)
      dup.files.forEach(file => {
        const pagesStr = file.pages !== null ? `${file.pages} pages` : 'N/A pages'
        console.log(`   ${file.filename}`)
        console.log(`   └─ ${file.sizeMB} MB, ${pagesStr}`)
      })
      console.log()
    }
  })
}

// Simple sprintf implementation
function sprintf(format: string, ...args: any[]): string {
  let i = 0
  return format.replace(/%-?(\d+)?\.?(\d+)?[sdfl]/g, (match) => {
    const arg = args[i++]
    const width = parseInt(match.match(/\d+/)?.[0] || '0')
    const precision = match.includes('.') ? parseInt(match.split('.')[1]) : null

    let str = ''
    if (match.endsWith('f')) {
      str = precision !== null ? arg.toFixed(precision) : arg.toString()
    } else {
      str = arg.toString()
    }

    if (match.startsWith('%-')) {
      return str.padEnd(width)
    } else {
      return str.padStart(width)
    }
  })
}

main()
