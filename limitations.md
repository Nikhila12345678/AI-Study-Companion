# Limitations

This document describes the current limitations of the application and areas that can be improved in future versions.

## 1. AI Limitations

The application depends on an external AI provider for features such as:

- Tutor responses
- Concept extraction
- Quiz generation
- Open-ended answer evaluation
- Recommendation generation

AI-generated content can sometimes be incorrect, incomplete, or less relevant than expected.

The application currently relies on prompts, retrieved context, and application-level validation to improve output quality, but AI output is not guaranteed to be correct in every case.

Open-ended answer evaluation is also an AI-based assessment and should not be treated as equivalent to human grading.



## 2. Retrieval Limitations

The current retrieval system uses local deterministic lexical-hashing embeddings.

This keeps the implementation simple and avoids an additional embedding API, but it has limitations compared with more advanced semantic embedding models.

Queries that use very different wording from the source material may not always retrieve the most relevant chunks.

Retrieval quality also depends on:

- Chunk size
- Extracted text quality
- Query wording
- Document structure
- Embedding representation

Improving semantic retrieval and adding better reranking would improve the system for larger and more diverse datasets.



## 3. Document Processing Limitations

Document processing depends on successful text extraction.

Documents with complex layouts may not produce perfect extracted text.

Potential problems include:

- Scanned PDFs
- Images containing text
- Tables
- Complex formatting
- Multi-column layouts
- Poor-quality documents

The current system works best when the uploaded material contains extractable text.

Scanned documents would require an OCR pipeline for better support.



## 4. Quiz Generation Limitations

AI-generated questions can occasionally require additional validation.

For example, during testing, a generated question was found to focus on document structure rather than testing the actual concept.

The generation prompts were improved to reduce this type of output, but generated questions are still not guaranteed to be perfect.

Future improvements could include stronger automatic validation before a question is shown to the learner.



## 5. Recommendation Limitations

Recommendations are based on the learning data currently available to the application.

If a learner has very little activity or assessment history, recommendations may have limited information to work with.

Recommendations can also become repetitive if the same concept remains the weakest area.

More detailed learner modeling could make recommendations more varied and personalized.



## 6. Scaling Limitations

The current implementation is designed primarily as a prototype and learning-focused application.

Some parts would need additional optimization for a much larger number of users and documents.

Potential scaling areas include:

- Database indexing
- Large knowledge collections
- Concurrent AI requests
- Job queue throughput
- Retrieval performance
- Analytics aggregation
- File processing
- AI provider rate limits

The current MongoDB-backed job worker is simple and may need to be replaced or extended with a more specialized queue system for higher workloads.



## 7. Database Limitations

MongoDB is used for both application data and background job persistence.

This simplifies the architecture, but large-scale workloads may require additional optimization.

Potential improvements include:

- More indexes
- Better pagination strategies
- Query optimization
- Data archival
- Separate analytics storage
- More efficient retrieval structures

Large collections would need regular monitoring to prevent inefficient queries.



## 8. Background Processing Limitations

Background jobs are processed by a separate worker process.

The current worker uses polling to check for pending jobs.

This is simple to operate but has limitations:

- Polling introduces some delay.
- A single worker limits throughput.
- Failed jobs require retry handling.
- Large workloads may require multiple workers.
- Job prioritization can become important as the system grows.

A production-scale version could use a dedicated queue such as Redis-based job processing or another managed queue system.



## 9. AI Cost Limitations

AI requests have an external usage cost.

The cost depends on factors such as:

- Number of AI requests
- Input context size
- Output length
- Model used
- Token usage
- Number of active users

Tutor conversations and repeated AI-generated questions can increase usage quickly.

The application tracks AI usage to make this easier to monitor.

Future improvements could include:

- Response caching
- Request deduplication
- Context-size limits
- Model selection based on task complexity
- Usage limits per user/project
- More detailed cost controls



## 10. AI Provider Dependency

The application currently depends on Groq for runtime AI functionality.

If the provider experiences:

- Downtime
- Rate limiting
- API changes
- Authentication problems
- Model availability issues

AI-powered features may be affected.

The provider layer reduces coupling to the rest of the application, but a complete fallback provider is not currently implemented.



## 11. Security Limitations

Authentication and authorization are enforced by the backend, and authentication uses HttpOnly cookies.

However, security still requires correct deployment configuration.

Important areas that require attention include:

- Protecting environment variables
- Secure cookie configuration in production
- HTTPS
- CORS configuration
- Rate limiting
- Request validation
- File upload validation
- AI API key protection
- Access control for project resources

The frontend should not be considered a security boundary. Authorization must remain enforced by the backend.



## 12. File Upload Limitations

File uploads require validation before processing.

As the application grows, additional protections may be required for:

- File size limits
- File type validation
- Malicious files
- Large documents
- Resource-intensive processing
- Storage limits

A production deployment should also consider isolated file processing and dedicated object storage.


## 13. UI Limitations

The current UI focuses on providing the complete learning workflow rather than supporting every possible interaction state.

Some areas that can be improved include:

- More detailed loading states
- Better empty states
- More informative error messages
- Better mobile responsiveness
- More detailed quiz feedback
- Improved accessibility
- Better visualization for large datasets

Some pages may also need additional optimization as the amount of learner data increases.

## 14. Analytics Limitations

Analytics are based on recorded learning events, quiz results, and mastery information.

The current analytics system is useful for application-level progress tracking but is not intended to be a complete learning analytics platform.

For larger datasets, pre-aggregation or a dedicated analytics system may be required.

The accuracy of activity-based analytics also depends on important actions being recorded as events consistently.


## 15. Mastery Limitations

Mastery is represented using application-defined scoring logic.

It is useful as a learning signal, but it should not be interpreted as an exact measurement of a learner's real-world knowledge.

A learner's actual understanding can be affected by factors that are not captured by the current model.

Future versions could incorporate more evidence types and longer-term learning history.



## 16. Recommendation and Mastery Data Dependency

Recommendations and growth information depend on the quality and amount of learner activity.

For a new learner:

  text
Little Activity
      ↓
Limited Evidence
      ↓
Less Reliable Mastery Signal
      ↓
Less Personalized Recommendation
