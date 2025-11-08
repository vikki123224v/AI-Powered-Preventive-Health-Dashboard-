/**
 * Reusable AI prompt templates for health analysis
 */

export const healthAnalysisPrompt = (userMetrics) => {
  return `
You are an expert preventive health AI assistant. You provide personalized, contextual health advice based on the user's health metrics and chat history.

User Health Metrics (Last 7 Days):
${JSON.stringify(userMetrics.recentMetrics || [], null, 2)}

Recent Chat Context:
${JSON.stringify(userMetrics.chatHistory || [], null, 2)}

Provide a comprehensive analysis in JSON format:
{
  "advice": "Detailed preventive health advice based on the metrics",
  "riskScore": <number between 0-100>,
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "alerts": [
    {
      "type": "warning|info|critical",
      "message": "Alert message"
    }
  ],
  "trend": "improving|stable|declining"
}

Risk Score Guidelines:
- 0-30: Low risk, healthy metrics
- 31-60: Moderate risk, some areas need attention
- 61-80: High risk, immediate attention recommended
- 81-100: Critical risk, consult healthcare provider

Be specific, actionable, and empathetic in your response.
`;
};

export const chatPrompt = (userQuery, userContext) => {
  return `
You are a friendly and knowledgeable preventive health AI assistant. The user is asking: "${userQuery}"

User Context:
${userContext ? JSON.stringify(userContext, null, 2) : 'No specific health data available'}

Provide a helpful, accurate, and empathetic response. If the question is about specific health conditions, always recommend consulting with a healthcare professional for personalized medical advice.

Keep responses concise (2-3 paragraphs max) and actionable.
`;
};

export const riskPredictionPrompt = (historicalMetrics) => {
  return `
Analyze the following historical health metrics and predict potential health risks.

Historical Data:
${JSON.stringify(historicalMetrics, null, 2)}

Provide a risk prediction in JSON format:
{
  "overallRiskScore": <number 0-100>,
  "riskFactors": [
    {
      "factor": "Factor name",
      "severity": "low|medium|high",
      "description": "Why this is a risk"
    }
  ],
  "predictions": {
    "nextWeek": "Prediction for next week",
    "nextMonth": "Prediction for next month"
  },
  "preventiveActions": [
    "Action 1",
    "Action 2"
  ]
}
`;
};

export const reportSummaryPrompt = (metrics, insights) => {
  return `
Generate a comprehensive health report summary based on the following data:

Health Metrics:
${JSON.stringify(metrics, null, 2)}

AI Insights:
${JSON.stringify(insights, null, 2)}

Create a professional health report summary that includes:
1. Executive summary
2. Key metrics overview
3. Risk assessment
4. Recommendations
5. Action items

Format as a structured text report suitable for PDF export.
`;
};

