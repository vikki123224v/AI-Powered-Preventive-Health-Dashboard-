import express from 'express';
import HealthMetric from '../database/models/HealthMetric.js';
import { normalizeMetrics, validateMetrics, generateDummyData } from '../utils/healthUtils.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const healthMetricInputSchema = z.object({
  heartRate: z.number().int().min(30).max(220).optional(),
  steps: z.number().int().min(0).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sugarLevel: z.number().min(0).max(500).optional(),
  bloodPressure: z.object({
    systolic: z.number().min(50).max(250).optional(),
    diastolic: z.number().min(30).max(150).optional()
  }).optional(),
  weight: z.number().min(0).optional(),
  notes: z.string().max(500).optional()
});

/**
 * GET /api/health
 * Get health metrics for a user (with optional date range)
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { startDate, endDate, limit = 30 } = req.query;

    const query = { userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const metrics = await HealthMetric.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .lean();

    // Normalize metrics
    const normalized = metrics.map(metric => normalizeMetrics(metric));

    res.json({
      success: true,
      count: normalized.length,
      metrics: normalized
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/health
 * Create/update health metric
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const validatedData = healthMetricInputSchema.parse(req.body);
    const normalized = normalizeMetrics(validatedData);

    // Create or update metric for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metric = await HealthMetric.findOneAndUpdate(
      { userId, date: { $gte: today, $lt: new Date(today.getTime() + 86400000) } },
      {
        userId,
        date: today,
        ...normalized
      },
      { upsert: true, new: true }
    );

    logger.info(`Health metric saved for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Health metric saved successfully',
      metric: normalizeMetrics(metric.toObject())
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

/**
 * GET /api/health/dummy
 * Generate dummy health data for testing/demo
 */
router.get('/dummy', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const days = parseInt(req.query.days) || 30;
    const dummyData = generateDummyData(days);

    // Save dummy data
    const metrics = await Promise.all(
      dummyData.map(data => {
        const metric = new HealthMetric({
          userId,
          ...data
        });
        return metric.save();
      })
    );

    res.json({
      success: true,
      message: `Generated ${days} days of dummy health data`,
      count: metrics.length,
      metrics: metrics.map(m => normalizeMetrics(m.toObject()))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/health/stats
 * Get aggregated health statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const metrics = await HealthMetric.find({
      userId,
      date: { $gte: startDate }
    }).lean();

    if (metrics.length === 0) {
      return res.json({
        success: true,
        stats: {
          avgHeartRate: 0,
          avgSteps: 0,
          avgSleep: 0,
          avgSugar: 0,
          totalDays: 0
        }
      });
    }

    const stats = {
      avgHeartRate: metrics.filter(m => m.heartRate).reduce((sum, m) => sum + m.heartRate, 0) / metrics.filter(m => m.heartRate).length || 0,
      avgSteps: metrics.filter(m => m.steps).reduce((sum, m) => sum + m.steps, 0) / metrics.filter(m => m.steps).length || 0,
      avgSleep: metrics.filter(m => m.sleepHours).reduce((sum, m) => sum + m.sleepHours, 0) / metrics.filter(m => m.sleepHours).length || 0,
      avgSugar: metrics.filter(m => m.sugarLevel).reduce((sum, m) => sum + m.sugarLevel, 0) / metrics.filter(m => m.sugarLevel).length || 0,
      totalDays: metrics.length
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
});

export default router;

