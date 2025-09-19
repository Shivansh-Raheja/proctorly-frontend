// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://proctorly-backend.onrender.com/api'
  : 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  // Candidates
  CANDIDATES: `${API_BASE_URL}/candidates`,
  CANDIDATE_BY_ID: (id: string) => `${API_BASE_URL}/candidates/${id}`,
  END_INTERVIEW: (id: string) => `${API_BASE_URL}/candidates/${id}/end`,
  
  // Logs
  LOGS: `${API_BASE_URL}/logs`,
  LOGS_BY_CANDIDATE: (candidateId: string) => `${API_BASE_URL}/logs/${candidateId}`,
  LOGS_STATS: (candidateId: string) => `${API_BASE_URL}/logs/stats/${candidateId}`,
  
  // Reports
  REPORTS: (candidateId: string, format: 'json' | 'pdf' = 'json') => 
    `${API_BASE_URL}/reports/${candidateId}?format=${format}`,
  
  // Upload
  UPLOAD: `${API_BASE_URL}/upload`,
  UPLOAD_BY_CANDIDATE: (candidateId: string) => `${API_BASE_URL}/upload/${candidateId}`,
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
  RATE_LIMIT_STATUS: `${API_BASE_URL}/rate-limit-status`
}

export default API_BASE_URL
