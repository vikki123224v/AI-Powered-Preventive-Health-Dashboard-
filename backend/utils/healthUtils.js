/**
 * Health metric normalization and validation utilities
 */

import { z } from 'zod';

// Validation schemas
export const healthMetricSchema = z.object({
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
 * Normalize health metrics to standard ranges
 */
export const normalizeMetrics = (metrics) => {
  const normalized = { ...metrics };

  // Normalize heart rate (resting: 60-100 is normal)
  if (normalized.heartRate) {
    if (normalized.heartRate < 60) normalized.heartRateStatus = 'low';
    else if (normalized.heartRate > 100) normalized.heartRateStatus = 'elevated';
    else normalized.heartRateStatus = 'normal';
  }

  // Normalize steps (10,000 is target)
  if (normalized.steps) {
    if (normalized.steps < 5000) normalized.stepsStatus = 'low';
    else if (normalized.steps < 10000) normalized.stepsStatus = 'moderate';
    else normalized.stepsStatus = 'excellent';
  }

  // Normalize sleep (7-9 hours is optimal)
  if (normalized.sleepHours) {
    if (normalized.sleepHours < 6) normalized.sleepStatus = 'insufficient';
    else if (normalized.sleepHours <= 9) normalized.sleepStatus = 'optimal';
    else normalized.sleepStatus = 'excessive';
  }

  // Normalize blood sugar (fasting: 70-100 mg/dL normal)
  if (normalized.sugarLevel) {
    if (normalized.sugarLevel < 70) normalized.sugarStatus = 'low';
    else if (normalized.sugarLevel <= 100) normalized.sugarStatus = 'normal';
    else if (normalized.sugarLevel <= 125) normalized.sugarStatus = 'prediabetic';
    else normalized.sugarStatus = 'diabetic';
  }

  // Normalize blood pressure
  if (normalized.bloodPressure) {
    const { systolic, diastolic } = normalized.bloodPressure;
    if (systolic < 120 && diastolic < 80) {
      normalized.bpStatus = 'normal';
    } else if (systolic < 130 && diastolic < 80) {
      normalized.bpStatus = 'elevated';
    } else if (systolic < 140 || diastolic < 90) {
      normalized.bpStatus = 'high_stage1';
    } else {
      normalized.bpStatus = 'high_stage2';
    }
  }

  return normalized;
};

/**
 * Calculate a simple risk score based on metrics
 */
export const calculateRiskScore = (metrics) => {
  let riskScore = 0;
  const factors = [];

  // Heart rate risk
  if (metrics.heartRate) {
    if (metrics.heartRate < 50 || metrics.heartRate > 120) {
      riskScore += 20;
      factors.push('Abnormal heart rate');
    }
  }

  // Steps risk (low activity)
  if (metrics.steps && metrics.steps < 5000) {
    riskScore += 15;
    factors.push('Low physical activity');
  }

  // Sleep risk
  if (metrics.sleepHours && metrics.sleepHours < 6) {
    riskScore += 20;
    factors.push('Insufficient sleep');
  }

  // Blood sugar risk
  if (metrics.sugarLevel) {
    if (metrics.sugarLevel < 70 || metrics.sugarLevel > 125) {
      riskScore += 25;
      factors.push('Abnormal blood sugar levels');
    }
  }

  // Blood pressure risk
  if (metrics.bloodPressure) {
    const { systolic, diastolic } = metrics.bloodPressure;
    if (systolic >= 140 || diastolic >= 90) {
      riskScore += 20;
      factors.push('High blood pressure');
    }
  }

  return {
    riskScore: Math.min(riskScore, 100),
    factors
  };
};

/**
 * Validate health metrics
 */
export const validateMetrics = (metrics) => {
  try {
    return healthMetricSchema.parse(metrics);
  } catch (error) {
    throw new Error(`Invalid health metrics: ${error.message}`);
  }
};

/**
 * Generate dummy health data for testing
 */
export const generateDummyData = (days = 30) => {
  const data = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date,
      heartRate: Math.floor(Math.random() * 40) + 60, // 60-100
      steps: Math.floor(Math.random() * 8000) + 3000, // 3000-11000
      sleepHours: (Math.random() * 3) + 6, // 6-9 hours
      sugarLevel: Math.floor(Math.random() * 30) + 85, // 85-115
      bloodPressure: {
        systolic: Math.floor(Math.random() * 20) + 110, // 110-130
        diastolic: Math.floor(Math.random() * 15) + 70 // 70-85
      },
      weight: (Math.random() * 10) + 65 // 65-75 kg
    });
  }

  return data.reverse(); // Oldest to newest
};

