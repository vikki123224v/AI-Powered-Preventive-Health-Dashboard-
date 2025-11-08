import express from 'express';
import { chatWithAI } from '../ai/runAnywhereClient.js';
import AIInsight from '../database/models/AIInsight.js';
import HealthMetric from '../database/models/HealthMetric.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const router = express.Router();

const chatSchema = z.object({
  query: z.string().min(1).max(1000),
  userId: z.string().optional()
});

/**
 * POST /api/chat
 * Chat with AI health assistant
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const validatedData = chatSchema.parse(req.body);
    const { query } = validatedData;

    // Get user's context including health metrics and chat history
    let userContext = null;
    if (userId) {
      // Get recent health metrics
      const recentMetrics = await HealthMetric.find({ userId })
        .sort({ date: -1 })
        .limit(7)
        .lean();
      
      // Get recent chat history
      const recentChats = await AIInsight.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      userContext = {
        recentMetrics: recentMetrics.map(m => ({
          date: m.date,
          heartRate: m.heartRate,
          steps: m.steps,
          sleepHours: m.sleepHours,
          sugarLevel: m.sugarLevel,
          bloodPressure: m.bloodPressure,
          weight: m.weight
        })),
        chatHistory: recentChats.map(c => ({
          query: c.query,
          response: c.aiResponse,
          timestamp: c.createdAt
        }))
      };
    }

    // Get AI response
    const aiResponse = await chatWithAI(query, userContext);

    // Save chat and insights to MongoDB if user is authenticated
    if (userId) {
      try {
        // Import chat utilities
        const { getChatCategory } = await import('../utils/chatUtils.js');
        
        // Determine chat category based on query content
        const category = getChatCategory(query);
        
        // Store the interaction in MongoDB
        const chatInsight = new AIInsight({
          userId,
          query,
          aiResponse: typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse),
          category,
          riskScore: 0, // Chat doesn't always have risk score
          metadata: {
            healthContext: userContext?.recentMetrics || [],
            chatContext: userContext?.chatHistory || []
          }
        });
        
        await chatInsight.save();
      } catch (saveError) {
        logger.warn('Failed to save AI insight:', saveError);
        // Don't fail the request if saving fails
      }
    }

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

/**
 * GET /api/chat/history
 * Get chat history for a user
 */
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { limit = 50 } = req.query;

    const history = await AIInsight.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('query aiResponse category createdAt')
      .lean();

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
});

export default router;

