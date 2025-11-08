import express from 'express';
import { predictHealthRisk, generateHealthAdvice } from '../ai/runAnywhereClient.js';
import HealthMetric from '../database/models/HealthMetric.js';
import { calculateRiskScore } from '../utils/healthUtils.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/risk
 * Calculate current risk score for a user
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get most recent metric
    const latestMetric = await HealthMetric.findOne({ userId })
      .sort({ date: -1 })
      .lean();

    if (!latestMetric) {
      return res.json({
        success: true,
        riskScore: 0,
        message: 'No health data available',
        factors: []
      });
    }

    // Calculate rule-based risk score
    const ruleBasedRisk = calculateRiskScore(latestMetric);

    // Get AI-based risk prediction
    let aiRisk = null;
    try {
      const historicalMetrics = await HealthMetric.find({ userId })
        .sort({ date: -1 })
        .limit(30)
        .lean();

      if (historicalMetrics.length > 0) {
        aiRisk = await predictHealthRisk(historicalMetrics);
      }
    } catch (aiError) {
      logger.warn('AI risk prediction failed, using rule-based only:', aiError);
    }

    // Combine rule-based and AI-based scores
    const finalRiskScore = aiRisk?.overallRiskScore 
      ? Math.round((ruleBasedRisk.riskScore + aiRisk.overallRiskScore) / 2)
      : ruleBasedRisk.riskScore;

    res.json({
      success: true,
      riskScore: finalRiskScore,
      riskLevel: finalRiskScore < 30 ? 'low' : finalRiskScore < 60 ? 'moderate' : finalRiskScore < 80 ? 'high' : 'critical',
      factors: ruleBasedRisk.factors,
      aiInsights: aiRisk,
      latestMetric: {
        date: latestMetric.date,
        heartRate: latestMetric.heartRate,
        steps: latestMetric.steps,
        sleepHours: latestMetric.sleepHours,
        sugarLevel: latestMetric.sugarLevel
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/risk/analyze
 * Get detailed AI analysis with recommendations
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get latest metrics
    const latestMetric = await HealthMetric.findOne({ userId })
      .sort({ date: -1 })
      .lean();

    if (!latestMetric) {
      return res.status(404).json({ error: 'No health data available' });
    }

    // Get AI health advice
    const advice = await generateHealthAdvice(latestMetric);

    res.json({
      success: true,
      analysis: advice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;

