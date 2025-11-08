import mongoose from 'mongoose';

const healthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  heartRate: {
    type: Number,
    min: 30,
    max: 220,
    validate: {
      validator: Number.isInteger,
      message: 'Heart rate must be an integer'
    }
  },
  steps: {
    type: Number,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Steps must be an integer'
    }
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  sugarLevel: {
    type: Number,
    min: 0,
    max: 500
  },
  bloodPressure: {
    systolic: { type: Number, min: 50, max: 250 },
    diastolic: { type: Number, min: 30, max: 150 }
  },
  weight: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
healthMetricSchema.index({ userId: 1, date: -1 });

export default mongoose.model('HealthMetric', healthMetricSchema);

