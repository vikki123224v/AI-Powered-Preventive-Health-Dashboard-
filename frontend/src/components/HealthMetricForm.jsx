import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function HealthMetricForm() {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    heartRate: '',
    steps: '',
    sleepHours: '',
    sugarLevel: '',
    weight: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build payload converting numeric strings to numbers and including userId header
      const payload = {};
      if (metrics.heartRate) payload.heartRate = Number(metrics.heartRate);
      if (metrics.steps) payload.steps = Number(metrics.steps);
      if (metrics.sleepHours) payload.sleepHours = Number(metrics.sleepHours);
      if (metrics.sugarLevel) payload.sugarLevel = Number(metrics.sugarLevel);
      if (metrics.weight) payload.weight = Number(metrics.weight);
      if (metrics.notes) payload.notes = metrics.notes;
      if (metrics.bloodPressure?.systolic || metrics.bloodPressure?.diastolic) {
        payload.bloodPressure = {};
        if (metrics.bloodPressure.systolic) payload.bloodPressure.systolic = Number(metrics.bloodPressure.systolic);
        if (metrics.bloodPressure.diastolic) payload.bloodPressure.diastolic = Number(metrics.bloodPressure.diastolic);
      }

      const headers = {};
      const localUserId = user?.id || localStorage.getItem('userId');
      if (localUserId) headers['x-user-id'] = localUserId;

      await axios.post('/api/health', payload, { headers });
  alert('Health metrics saved successfully!');
  // Notify dashboard to refresh
  try { window.dispatchEvent(new Event('health:updated')); } catch (e) { /* ignore */ }
      setMetrics({
        bloodPressure: {
          systolic: '',
          diastolic: ''
        },
        heartRate: '',
        steps: '',
        sleepHours: '',
        sugarLevel: '',
        weight: '',
        notes: ''
      });
    } catch (error) {
      alert('Error saving metrics: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bloodPressure.')) {
      const key = name.split('.')[1];
      setMetrics(prev => ({
        ...prev,
        bloodPressure: {
          ...prev.bloodPressure,
          [key]: value
        }
      }));
    } else {
      setMetrics(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 glass">
      <h2 className="text-2xl font-bold mb-6">Add Health Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Blood Pressure (mmHg)</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="bloodPressure.systolic"
              value={metrics.bloodPressure.systolic}
              onChange={handleChange}
              placeholder="Systolic"
              className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500"
            />
            <span className="self-center">/</span>
            <input
              type="number"
              name="bloodPressure.diastolic"
              value={metrics.bloodPressure.diastolic}
              onChange={handleChange}
              placeholder="Diastolic"
              className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
          <input
            type="number"
            name="heartRate"
            value={metrics.heartRate}
            onChange={handleChange}
            placeholder="Heart Rate"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Steps</label>
          <input
            type="number"
            name="steps"
            value={metrics.steps}
            onChange={handleChange}
            placeholder="Daily Steps"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sleep Hours</label>
          <input
            type="number"
            name="sleepHours"
            value={metrics.sleepHours}
            onChange={handleChange}
            placeholder="Hours of Sleep"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Blood Sugar (mg/dL)</label>
          <input
            type="number"
            name="sugarLevel"
            value={metrics.sugarLevel}
            onChange={handleChange}
            placeholder="Blood Sugar Level"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={metrics.weight}
            onChange={handleChange}
            placeholder="Weight"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          name="notes"
          value={metrics.notes}
          onChange={handleChange}
          placeholder="Any additional notes"
          className="w-full p-2 rounded border focus:ring-2 focus:ring-primary-500 h-24"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors"
      >
        Save Health Metrics
      </button>
    </form>
  );
}