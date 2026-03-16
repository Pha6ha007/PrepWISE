# S01: Counsel-Chat Dataset Ingestion — UAT

## How to Test

1. **Dry run (no Pinecone/OpenAI cost):**
   ```bash
   npx tsx scripts/ingest-counseling-datasets.ts --dry-run
   ```
   - Should download CSV from HuggingFace
   - Should show total rows, topic distribution, and 3 sample chunks
   - Should NOT upload anything

2. **Full ingestion:**
   ```bash
   npx tsx scripts/ingest-counseling-datasets.ts
   ```
   - Should download, parse, embed, and upload to Pinecone `counseling_qa` namespace
   - Should save metadata to KnowledgeBase table
   - Check Pinecone dashboard: `counseling_qa` namespace should have vectors

3. **Duplicate protection:**
   - Run the script again
   - Should warn about existing entries and give 5 seconds to cancel

4. **Custom upvote filter:**
   ```bash
   npx tsx scripts/ingest-counseling-datasets.ts --min-upvotes=3 --dry-run
   ```
   - Should show fewer chunks than default (upvotes >= 3 instead of >= 1)
