---
id: T01
parent: S01
milestone: M001-f68xru
provides:
  - scripts/ingest-counseling-datasets.ts — full ingestion pipeline for counsel-chat
  - COUNSELING_QA namespace in lib/pinecone/constants.ts
  - counseling_qa context hint in lib/pinecone/retrieval.ts query expansion
  - CSV download from HuggingFace with redirect handling
  - Q&A pair chunking with upvote filtering and junk detection
requires:
  - slice: none
    provides: standalone
affects: []
key_files:
  - scripts/ingest-counseling-datasets.ts
  - lib/pinecone/constants.ts
  - lib/pinecone/retrieval.ts
key_decisions:
  - "Q&A pairs chunked as atomic units — question + answer concatenated per chunk (D001)"
  - "Filter by upvotes >= 1 for quality (D002)"
  - "Metadata includes topic, therapistInfo, upvotes, questionID from dataset"
patterns_established:
  - "CSV dataset ingestion pattern alongside existing PDF pattern"
drill_down_paths:
  - .gsd/milestones/M001-f68xru/slices/S01/tasks/T01-PLAN.md
duration: 10min
verification_result: pass
completed_at: 2026-03-16T10:10:00Z
---

# T01: Counsel-Chat Ingestion Script and Namespace Registration

**Created ingestion script for HuggingFace counsel-chat dataset with Q&A pair chunking, upvote filtering, and Pinecone upsert to counseling_qa namespace**

## What Happened

Built `scripts/ingest-counseling-datasets.ts` following the existing `ingest-knowledge.ts` pattern but adapted for CSV input and Q&A pair chunking. The script downloads the counsel-chat CSV from HuggingFace (with redirect handling), parses it with a robust CSV parser that handles quoted fields with embedded commas/newlines, filters by upvotes, builds atomic Q&A chunks (question title + text + therapist answer), creates embeddings, upserts to Pinecone, and saves Prisma metadata. Added `COUNSELING_QA` to NAMESPACES and the query expansion context hint.

## Deviations
None.

## Files Created/Modified
- `scripts/ingest-counseling-datasets.ts` — New script (320 lines)
- `lib/pinecone/constants.ts` — Added COUNSELING_QA namespace
- `lib/pinecone/retrieval.ts` — Added counseling_qa context hint for query expansion
