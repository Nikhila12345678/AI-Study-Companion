# Future Improvements

The current version covers the main learning workflow, but there are several areas I would improve if I had more development time.

## 1. Improve Retrieval Quality

The current retrieval system works with local deterministic embeddings.

My next step would be to improve semantic retrieval so that queries with different wording can still find the correct content.

I would work on:

- Better embedding models
- Retrieval reranking
- Better chunking strategies
- Metadata-based filtering
- Retrieval evaluation using a small set of test questions

This would mainly improve the Tutor and other features that depend on project knowledge.



## 2. Improve Document Support

Currently, the system works best with documents that contain extractable text.

With more time, I would add better support for:

- Scanned PDFs
- OCR
- Tables
- Images containing text
- Complex document layouts
- More file formats

I would also improve error messages so the user knows exactly why a document could not be processed.



## 3. Improve AI Evaluation

I would create a small evaluation dataset containing real examples of:

- Tutor questions
- Retrieval queries
- Generated quiz questions
- Open-ended answers
- Recommendations

For each feature, I would define expected behavior and compare the actual output against it.

For example:

Question
   ↓
Expected relevant concepts
   ↓
Retrieved chunks
   ↓
AI response
   ↓
Check relevance / grounding