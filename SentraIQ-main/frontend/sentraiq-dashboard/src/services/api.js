import axios from 'axios';

// Point the frontend explicitly to the local FastAPI backend by default.
// If you later introduce Vite envs, you can swap this to:
// const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`;
const API_BASE = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getHealth: () => api.get('/health'),
};

export const ingestAPI = {
  uploadLog: (formData) =>
    axios.post(`${API_BASE}/ingest/log`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadDocument: (formData) =>
    axios.post(`${API_BASE}/ingest/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getLogs: () => api.get('/ingest/logs'),
  getDocuments: () => api.get('/ingest/documents'),
};

export const evidenceAPI = {
  mapLog: (logId) => api.post(`/evidence/map-log/${logId}`),
  mapDocument: (docId) => api.post(`/evidence/map-document/${docId}`),
  getByControl: (controlId) => api.get(`/evidence/by-control/${controlId}`),
};

export const assuranceAPI = {
  query: (query) => api.post('/assurance/query', { query }),
  generatePack: (data) => api.post('/assurance/generate-pack', data),
  downloadPack: (packId) => `${API_BASE}/assurance/download/${packId}`,
};

export default api;
