import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitAnswerSchema } from '../validators/quizValidators.js';
import * as quiz from '../controllers/quizController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Quiz from '../models/Quiz.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();
router.use(requireAuth);

const loadOwnedQuiz = asyncHandler(async (req, res, next) => {
   console.log('LOAD PROJECT START');
  const quizDoc = await Quiz.findById(req.params.quizId);
  if (!quizDoc) throw ApiError.notFound('Quiz not found.');
  if (String(quizDoc.userId) !== String(req.user._id)) throw ApiError.forbidden('You do not have access to this quiz.');
  req.project = { _id: quizDoc.projectId };
  next();
});

router.get('/:quizId', loadOwnedQuiz, quiz.getQuiz);
router.get('/:quizId/questions', loadOwnedQuiz, quiz.getQuizQuestions);
router.post('/:quizId/questions/next', loadOwnedQuiz, quiz.nextQuestion);
router.post('/:quizId/questions/:questionId/answer', loadOwnedQuiz, validate(submitAnswerSchema), quiz.answerQuestion);
router.post('/:quizId/complete', loadOwnedQuiz, quiz.completeQuizHandler);

export default router;
