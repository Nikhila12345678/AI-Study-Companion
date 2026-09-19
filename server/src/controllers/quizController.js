import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { startQuiz, addNextQuestion, submitAnswer, completeQuiz } from '../services/quiz/quizService.js';
import { emitEvent, enqueueJob } from '../events/eventBus.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

function sanitizeQuestion(q) {
  const obj = q.toObject ? q.toObject() : q;
  // Never leak the correct answer / grading key to the client before it's answered.
  if (!obj.answeredAt) {
    delete obj.correctAnswer;
    delete obj.explanation;
    delete obj._keyPoints;
  }
  return obj;
}

export const createQuiz = asyncHandler(async (req, res) => {
  console.log("CREATE QUIZ HIT");
  
  const { conceptId } = req.body;

  console.log("conceptId:", conceptId);

  const { quiz, question } = await startQuiz({
    project: req.project,
    user: req.user,
    conceptId
  });

  await emitEvent({
    type: 'QUIZ_STARTED',
    userId: req.user._id,
    projectId: req.project._id,
    payload: {
      quizId: quiz._id,
      conceptId: conceptId || null
    }
  });

  res.status(201).json({
    quiz,
    question: sanitizeQuestion(question)
  });
});

export const listQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ projectId: req.project._id, userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ quizzes });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, projectId: req.project._id, userId: req.user._id }).lean();
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  res.json({ quiz });
});

export const getQuizQuestions = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, projectId: req.project._id, userId: req.user._id });
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  const questions = await Question.find({ quizId: quiz._id }).sort({ createdAt: 1 });
  res.json({ questions: questions.map(sanitizeQuestion) });
});

export const nextQuestion = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, projectId: req.project._id, userId: req.user._id });
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  if (quiz.status === 'completed') throw ApiError.badRequest('This quiz is already complete.');
  const question = await addNextQuestion({ quiz, project: req.project, user: req.user });
  res.status(201).json({ question: sanitizeQuestion(question) });
});

export const answerQuestion = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, projectId: req.project._id, userId: req.user._id });
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  const question = await Question.findOne({ _id: req.params.questionId, quizId: quiz._id });
  if (!question) throw ApiError.notFound('Question not found.');

  const { question: answered, repeatedMistake } = await submitAnswer({ question, project: req.project, user: req.user, answer: req.body.answer });

  await emitEvent({
    type: 'QUESTION_ANSWERED', userId: req.user._id, projectId: req.project._id,
    payload: { quizId: quiz._id, questionId: answered._id, conceptName: answered.conceptName, isCorrect: answered.isCorrect }
  });
  await emitEvent({ type: 'MASTERY_UPDATED', userId: req.user._id, projectId: req.project._id, payload: { conceptName: answered.conceptName } });

  res.json({ question: sanitizeQuestion(answered), repeatedMistake });
});

export const completeQuizHandler = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, projectId: req.project._id, userId: req.user._id });
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  if (quiz.status === 'completed') throw ApiError.badRequest('This quiz is already complete.');

  const repeated = await Question.findOne({ quizId: quiz._id }).sort({ createdAt: -1 }).lean();
  const assessment = await completeQuiz({ quiz, project: req.project, user: req.user });

  await emitEvent({ type: 'QUIZ_COMPLETED', userId: req.user._id, projectId: req.project._id, payload: { quizId: quiz._id, score: assessment.overallScore } });
  await emitEvent({ type: 'ASSESSMENT_COMPLETED', userId: req.user._id, projectId: req.project._id, payload: { assessmentId: assessment._id } });

  await enqueueJob({
    type: 'LEARNING_WORKFLOW',
    payload: { projectId: String(req.project._id), userId: String(req.user._id), repeatedMistakeConceptName: repeated?.conceptName || null },
    idempotencyKey: `learning-workflow-quiz-${quiz._id}`,
    userId: req.user._id, projectId: req.project._id
  });

  res.json({ assessment });
});
