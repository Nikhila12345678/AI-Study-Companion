import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendMessageSchema } from '../validators/tutorValidators.js';
import * as tutor from '../controllers/tutorController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Conversation from '../models/Conversation.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();
router.use(requireAuth);

// /api/conversations/:conversationId — verified via the conversation's own
// projectId/userId, matching the PRD's standalone conversation endpoints.
const loadOwnedConversation = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw ApiError.notFound('Conversation not found.');
  if (String(conversation.userId) !== String(req.user._id)) throw ApiError.forbidden('You do not have access to this conversation.');
  req.project = { _id: conversation.projectId };
  next();
});

router.get('/:conversationId', loadOwnedConversation, tutor.getConversation);
router.get('/:conversationId/messages', loadOwnedConversation, tutor.listMessages);
router.post('/:conversationId/messages', loadOwnedConversation, validate(sendMessageSchema), tutor.postMessage);

export default router;
