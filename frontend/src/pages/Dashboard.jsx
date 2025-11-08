import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Moon, Droplet, TrendingUp, AlertCircle } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import HealthMetricForm from '../components/HealthMetricForm';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MetricCard = ({ icon: Icon, label, value, unit, status, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value} <span className="text-lg text-gray-500">{unit}</span>
      </p>
      {status && (
        <p className={`text-xs mt-2 ${status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
          {status === 'good' ? '✓ Normal' : status === 'warning' ? '⚠ Monitor' : '⚠ Alert'}
        </p>
      )}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [stats, setStats] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const onUpdate = () => fetchData();
    window.addEventListener('health:updated', onUpdate);
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => { clearInterval(interval); window.removeEventListener('health:updated', onUpdate); };
  }, []);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      // Fetch health metrics
      const metricsRes = await axios.get(`/api/health?userId=${userId}&limit=30`);
      setMetrics(metricsRes.data.metrics || []);

      // Fetch stats
      const statsRes = await axios.get(`/api/health/stats?userId=${userId}`);
      setStats(statsRes.data.stats);

      // Fetch risk score
      const riskRes = await axios.get(`/api/risk?userId=${userId}`);
      setRiskScore(riskRes.data.riskScore || 0);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate dummy data if no real data
  const latestMetric = metrics[metrics.length - 1] || {
    heartRate: 72,
    steps: 8500,
    sleepHours: 7.5,
    sugarLevel: 95
  };

  const chartData = {
    labels: metrics.slice(-7).map(m => new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Heart Rate',
        data: metrics.slice(-7).map(m => m.heartRate || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Steps (÷100)',
        data: metrics.slice(-7).map(m => (m.steps || 0) / 100),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const riskChartData = {
    labels: ['Risk Score'],
    datasets: [{
      data: [riskScore, 100 - riskScore],
      backgroundColor: [
        riskScore < 30 ? 'rgb(34, 197, 94)' : riskScore < 60 ? 'rgb(234, 179, 8)' : riskScore < 80 ? 'rgb(249, 115, 22)' : 'rgb(239, 68, 68)',
        'rgb(229, 231, 235)'
      ],
      borderWidth: 0
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor your health metrics and insights</p>
      </div>

        {/* Health Metric Form */}
        <HealthMetricForm />

        {/* Risk Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card bg-gradient-to-r from-primary-600 to-primary-400 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overall Risk Score</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold">{riskScore}</span>
              <span className="text-xl opacity-90">/100</span>
            </div>
            <p className="text-sm opacity-90 mt-2">
              {riskScore < 30 ? 'Low Risk - Keep it up!' : 
               riskScore < 60 ? 'Moderate Risk - Some areas need attention' :
               riskScore < 80 ? 'High Risk - Please monitor closely' :
               'Critical Risk - Consult healthcare provider'}
            </p>
          </div>
          <div className="w-24 h-24">
            <Doughnut
              data={riskChartData}
              options={{
                cutout: '70%',
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: false }
                },
                maintainAspectRatio: true,
                responsive: true
              }}
            />
            <div className="relative -top-[4.5rem] text-center">
              <span className="text-xl font-bold">{riskScore}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Heart}
          label="Heart Rate"
          value={latestMetric.heartRate || 0}
          unit="bpm"
          status={latestMetric.heartRate && latestMetric.heartRate >= 60 && latestMetric.heartRate <= 100 ? 'good' : 'warning'}
        />
        <MetricCard
          icon={Activity}
          label="Steps Today"
          value={latestMetric.steps?.toLocaleString() || 0}
          unit="steps"
          status={latestMetric.steps && latestMetric.steps >= 10000 ? 'good' : latestMetric.steps >= 5000 ? 'warning' : 'alert'}
        />
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={latestMetric.sleepHours?.toFixed(1) || 0}
          unit="hours"
          status={latestMetric.sleepHours && latestMetric.sleepHours >= 7 && latestMetric.sleepHours <= 9 ? 'good' : 'warning'}
        />
        <MetricCard
          icon={Droplet}
          label="Blood Sugar"
          value={latestMetric.sugarLevel || 0}
          unit="mg/dL"
          status={latestMetric.sugarLevel && latestMetric.sugarLevel >= 70 && latestMetric.sugarLevel <= 100 ? 'good' : 'warning'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-4"
          style={{ height: '300px' }}
        >
          <h3 className="text-lg font-semibold mb-2">Health Trends (Last 7 Days)</h3>
          <div className="h-[250px] w-full">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { font: { size: 10 } } },
                  x: { ticks: { font: { size: 10 } } }
                }
              }}
            />
          </div>
            
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          {stats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Avg Heart Rate</span>
                <span className="font-semibold">{stats.avgHeartRate.toFixed(1)} bpm</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Avg Steps</span>
                <span className="font-semibold">{stats.avgSteps.toFixed(0)} steps</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Avg Sleep</span>
                <span className="font-semibold">{stats.avgSleep.toFixed(1)} hours</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Data Points</span>
                <span className="font-semibold">{stats.totalDays} days</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No statistics available</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

