import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { answerTutorQuestion } from '../services/ai/tutorService.js';
import { emitEvent } from '../events/eventBus.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const createConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.create({ projectId: req.project._id, userId: req.user._id });
  res.status(201).json({ conversation });
});

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ projectId: req.project._id, userId: req.user._id }).sort({ lastMessageAt: -1 }).lean();
  res.json({ conversations });
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, projectId: req.project._id, userId: req.user._id }).lean();
  if (!conversation) throw ApiError.notFound('Conversation not found.');
  res.json({ conversation });
});

export const listMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, projectId: req.project._id, userId: req.user._id });
  if (!conversation) throw ApiError.notFound('Conversation not found.');
  const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).lean();
  res.json({ messages });
});

export const postMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, projectId: req.project._id, userId: req.user._id });
  if (!conversation) throw ApiError.notFound('Conversation not found.');

  const userMessage = await Message.create({
    conversationId: conversation._id, projectId: req.project._id, role: 'user', content: req.body.content
  });

  const recentMessages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(8).lean();

  const { answer, grounded, citations, suggestedFollowUps } = await answerTutorQuestion({
    project: req.project, user: req.user, question: req.body.content, recentMessages: recentMessages.reverse()
  });

  const assistantMessage = await Message.create({
    conversationId: conversation._id, projectId: req.project._id, role: 'assistant',
    content: answer, grounded, citations, suggestedFollowUps
  });

  conversation.lastMessageAt = new Date();
  if (conversation.title === 'New conversation') {
    conversation.title = req.body.content.slice(0, 60);
  }
  await conversation.save();

  await emitEvent({
    type: 'TUTOR_INTERACTION', userId: req.user._id, projectId: req.project._id,
    payload: { conversationId: conversation._id, grounded, citationCount: citations.length }
  });

  res.status(201).json({ userMessage, assistantMessage });
});
