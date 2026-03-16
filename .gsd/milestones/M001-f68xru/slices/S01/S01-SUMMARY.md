---
id: S01
milestone: M001-f68xru
provides:
  - scripts/ingest-counseling-datasets.ts — full counsel-chat ingestion pipeline
  - COUNSELING_QA namespace registered in Pinecone constants
  - counseling_qa query expansion context in retrieval.ts
requires: []
affects: []
key_files:
  - scripts/ingest-counseling-datasets.ts
  - lib/pinecone/constants.ts
  - lib/pinecone/retrieval.ts
key_decisions:
  - "Q&A pairs as atomic chunks (D001)"
  - "Upvote filtering >= 1 (D002)"
patterns_established:
  - "CSV dataset ingestion pattern alongside existing PDF ingestion"
drill_down_paths:
  - .gsd/milestones/M001-f68xru/slices/S01/tasks/T01-SUMMARY.md
verification_result: pass
completed_at: 2026-03-16T10:10:00Z
---

# S01: Counsel-Chat Dataset Ingestion

**Ingestion script for HuggingFace counsel-chat dataset — downloads CSV, creates Q&A pair chunks, embeds, upserts to Pinecone counseling_qa namespace with Prisma metadata**

## What Was Built
Full ingestion pipeline in `scripts/ingest-counseling-datasets.ts` that downloads the nbertagnolli/counsel-chat dataset from HuggingFace, parses CSV with robust handling of quoted fields, filters by upvotes, creates atomic Q&A chunks, generates embeddings via text-embedding-3-small, upserts to Pinecone `counseling_qa` namespace, and saves KnowledgeBase metadata to Prisma. Supports `--dry-run` and `--min-upvotes=N` flags. Registered the new namespace in constants and retrieval query expansion.
