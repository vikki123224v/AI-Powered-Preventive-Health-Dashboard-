import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  category: {
    type: String,
    enum: ['preventive', 'diagnostic', 'lifestyle', 'nutrition', 'exercise', 'general'],
    default: 'general'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
aiInsightSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('AIInsight', aiInsightSchema);

