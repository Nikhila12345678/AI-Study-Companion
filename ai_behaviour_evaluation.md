AI Behavior Evaluation:
AI behavior was evaluated mainly through functional testing and end-to-end workflow testing rather than relying only on model-generated output.
# Tutor quality
The Tutor was tested with different types of questions:
    • Questions that were directly related to the uploaded material 
    • Questions requiring information from retrieved chunks 
    • Questions unrelated to the uploaded material 
    • Follow-up questions 
For grounded questions, the response was checked for relevance to the project material and whether the retrieved context supported the answer.
For questions where the project did not contain enough information, the system was tested to ensure that it did not confidently present unrelated information as project-grounded content.

# Retrieval quality
Retrieval was tested by uploading actual study material and querying concepts contained in that material.
The retrieved chunks were checked to verify that:
    • Relevant chunks were returned for related queries. 
    • Retrieved content belonged to the correct project/material. 
    • The Tutor received retrieved context before generating the response. 
    • Unrelated questions did not automatically receive unrelated project content. 
The retrieval pipeline was also tested as part of the Tutor flow rather than as an isolated embedding experiment.

# Assessment / Quiz quality
Quiz generation was tested using project concepts and different difficulty levels.
Generated questions were checked for:
    • Correct concept association 
    • Valid answer/options 
    • Explanation 
    • Appropriate difficulty 
    • Relevance to the learning material 
During testing, an issue was found where an AI-generated question focused on a page number/document structure instead of testing the actual concept. The quiz prompt was then strengthened to explicitly require concept understanding, recall, application, comparison, or reasoning and to avoid questions about page numbers, headings, tables of contents, or document locations.
This was one of the prompt-level quality improvements made during testing.

# Adaptive assessment
The quiz system was tested with different mastery states.
The selection logic was checked against:
    • Low mastery 
    • Repeated mistakes 
    • Number of previous evidence items 
    • Previously assessed concepts 
The purpose was to verify that concepts needing more practice received higher priority instead of treating every concept identically.

# Mastery evaluation
After answering quiz questions, the resulting learning evidence was checked to verify that it affected the corresponding concept mastery.
The mastery system was tested across multiple attempts rather than treating a single answer as the complete mastery value.
This allowed the assessment result to feed into the later learning workflow.

# Recommendation evaluation
Recommendations were tested after learning activity and quiz completion.
The recommendation output was checked against the learner's:
    • Weak concepts 
    • Mastery scores 
    • Repeated mistakes 
    • Learning history 
    • Growth information 
The recommendation workflow was also tested through the background worker to verify that quiz completion could trigger the learning workflow and eventually produce a recommendation.

# End-to-end evaluation
The most important evaluation was the complete learning loop.
       Material -> Knowledge -> Retrieval -> Tutor -> Quiz -> Assessment -> Mastery -> Growth -> Recommendation
   
Each stage was tested through the actual application APIs and UI rather than evaluating the AI output independently from the rest of the system.

# AI observability
AI requests were also checked through the AI usage system.
The application records information such as:
    • Model 
    • Request type 
    • Latency 
    • Token usage 
    • Success/failure 
    • User/project context 
This makes it possible to inspect AI behavior and failures through the admin interface.
