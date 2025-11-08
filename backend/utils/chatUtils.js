/**
 * Determines chat category based on query content
 */
export const getChatCategory = (query) => {
  const query_lower = query.toLowerCase();
  
  if (query_lower.includes('diet') || query_lower.includes('food') || query_lower.includes('nutrition')) {
    return 'nutrition';
  }
  if (query_lower.includes('exercise') || query_lower.includes('workout') || query_lower.includes('activity')) {
    return 'exercise';
  }
  if (query_lower.includes('prevention') || query_lower.includes('risk')) {
    return 'preventive';
  }
  if (query_lower.includes('symptom') || query_lower.includes('diagnosis')) {
    return 'diagnostic';
  }
  if (query_lower.includes('lifestyle') || query_lower.includes('habit')) {
    return 'lifestyle';
  }
  return 'general';
};