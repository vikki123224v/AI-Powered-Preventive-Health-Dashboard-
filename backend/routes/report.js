import express from 'express';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import { createWriteStream, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import HealthMetric from '../database/models/HealthMetric.js';
import AIInsight from '../database/models/AIInsight.js';
import { generateHealthAdvice } from '../ai/runAnywhereClient.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/report/pdf
 * Generate PDF health report
 */
router.get('/pdf', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get health metrics
    const metrics = await HealthMetric.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 }).lean();

    // Get AI insights
    const insights = await AIInsight.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get latest AI analysis
    let aiAnalysis = null;
    if (metrics.length > 0) {
      const latestMetric = metrics[metrics.length - 1];
      try {
        aiAnalysis = await generateHealthAdvice(latestMetric);
      } catch (error) {
        logger.warn('Failed to generate AI analysis for report:', error);
      }
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `health-report-${userId}-${Date.now()}.pdf`;
    const filepath = join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    try {
      mkdirSync(join(process.cwd(), 'temp'), { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Write PDF to file
    const stream = createWriteStream(filepath);
    doc.pipe(stream);

    // PDF Content
    doc.fontSize(20).text('Health Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.moveDown();
    if (aiAnalysis) {
      doc.fontSize(11).text(aiAnalysis.advice || 'No analysis available');
      doc.moveDown();
      doc.text(`Risk Score: ${aiAnalysis.riskScore || 'N/A'}/100`);
    } else {
      doc.fontSize(11).text('Health data collected over the reporting period.');
    }
    doc.moveDown(2);

    // Metrics Overview
    doc.fontSize(16).text('Metrics Overview', { underline: true });
    doc.moveDown();
    
    if (metrics.length > 0) {
      const avgHeartRate = metrics.filter(m => m.heartRate).reduce((sum, m) => sum + m.heartRate, 0) / metrics.filter(m => m.heartRate).length || 0;
      const avgSteps = metrics.filter(m => m.steps).reduce((sum, m) => sum + m.steps, 0) / metrics.filter(m => m.steps).length || 0;
      const avgSleep = metrics.filter(m => m.sleepHours).reduce((sum, m) => sum + m.sleepHours, 0) / metrics.filter(m => m.sleepHours).length || 0;
      const avgSugar = metrics.filter(m => m.sugarLevel).reduce((sum, m) => sum + m.sugarLevel, 0) / metrics.filter(m => m.sugarLevel).length || 0;

      doc.fontSize(11);
      doc.text(`Average Heart Rate: ${avgHeartRate.toFixed(1)} bpm`);
      doc.text(`Average Steps: ${avgSteps.toFixed(0)} steps/day`);
      doc.text(`Average Sleep: ${avgSleep.toFixed(1)} hours/night`);
      doc.text(`Average Blood Sugar: ${avgSugar.toFixed(1)} mg/dL`);
    } else {
      doc.text('No metrics available for this period.');
    }
    doc.moveDown(2);

    // Recommendations
    if (aiAnalysis && aiAnalysis.recommendations) {
      doc.fontSize(16).text('Recommendations', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      aiAnalysis.recommendations.forEach(rec => {
        doc.text(`• ${rec}`);
      });
      doc.moveDown(2);
    }

    // Finalize PDF
    doc.end();

    // Wait for stream to finish
    stream.on('finish', () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          logger.error('Error sending PDF:', err);
        } else {
          // Clean up file after download
          setTimeout(() => {
            try {
              unlinkSync(filepath);
            } catch (cleanupError) {
              logger.warn('Failed to cleanup PDF file:', cleanupError);
            }
          }, 5000);
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/report/csv
 * Generate CSV health report
 */
router.get('/csv', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get health metrics
    const metrics = await HealthMetric.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 }).lean();

    if (metrics.length === 0) {
      return res.status(404).json({ error: 'No health data available' });
    }

    // Prepare CSV data
    const csvData = metrics.map(metric => ({
      date: new Date(metric.date).toLocaleDateString(),
      heartRate: metric.heartRate || '',
      steps: metric.steps || '',
      sleepHours: metric.sleepHours || '',
      sugarLevel: metric.sugarLevel || '',
      bloodPressureSystolic: metric.bloodPressure?.systolic || '',
      bloodPressureDiastolic: metric.bloodPressure?.diastolic || '',
      weight: metric.weight || ''
    }));

    const filename = `health-report-${userId}-${Date.now()}.csv`;
    const filepath = join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    try {
      mkdirSync(join(process.cwd(), 'temp'), { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Write CSV
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'heartRate', title: 'Heart Rate (bpm)' },
        { id: 'steps', title: 'Steps' },
        { id: 'sleepHours', title: 'Sleep (hours)' },
        { id: 'sugarLevel', title: 'Blood Sugar (mg/dL)' },
        { id: 'bloodPressureSystolic', title: 'BP Systolic' },
        { id: 'bloodPressureDiastolic', title: 'BP Diastolic' },
        { id: 'weight', title: 'Weight (kg)' }
      ]
    });

    await csvWriter.writeRecords(csvData);

    res.download(filepath, filename, (err) => {
      if (err) {
        logger.error('Error sending CSV:', err);
      } else {
        // Clean up file after download
        setTimeout(() => {
          try {
            unlinkSync(filepath);
          } catch (cleanupError) {
            logger.warn('Failed to cleanup CSV file:', cleanupError);
          }
        }, 5000);
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

