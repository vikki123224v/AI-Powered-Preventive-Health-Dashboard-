import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState({ pdf: false, csv: false });

  const downloadReport = async (type) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`/api/report/${type}?userId=${userId}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health-report-${Date.now()}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to download ${type} report:`, error);
      alert(`Failed to download ${type} report. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Health Reports</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and download comprehensive health reports in PDF or CSV format
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">PDF Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive health summary with AI insights
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download a detailed PDF report including your health metrics, AI-generated insights, 
            risk assessment, and personalized recommendations.
          </p>
          <button
            onClick={() => downloadReport('pdf')}
            disabled={loading.pdf}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading.pdf ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">CSV Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Raw health data in spreadsheet format
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Export your health metrics as CSV for analysis in Excel, Google Sheets, or other 
            data analysis tools.
          </p>
          <button
            onClick={() => downloadReport('csv')}
            disabled={loading.csv}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading.csv ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </>
            )}
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      >
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Report Information</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Reports include data from the last 30 days by default</li>
          <li>PDF reports contain AI-generated insights and recommendations</li>
          <li>CSV files include all raw health metric data</li>
          <li>Reports are generated on-demand and include the most recent data</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Reports;

