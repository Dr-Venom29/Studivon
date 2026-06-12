const TASKS_URL = '/api/tasks';
const AUTH_URL = '/api/auth';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('studivon_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic robust request helper to avoid JSON parsing crashes
async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    throw new Error('Connection refused: Make sure the Studivon backend server is running.');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      // Ignore JSON parse errors on error responses to preserve HTTP status codes
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Authentication Endpoints
  async login(username, password) {
    const data = await request(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    // Save token to localStorage
    if (data && data.token) {
      localStorage.setItem('studivon_token', data.token);
      localStorage.setItem('studivon_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(username, password, goal) {
    const data = await request(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, goal }),
    });
    
    // Save token to localStorage
    if (data && data.token) {
      localStorage.setItem('studivon_token', data.token);
      localStorage.setItem('studivon_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('studivon_token');
    localStorage.removeItem('studivon_user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('studivon_token');
  },

  // Task & Dossier Endpoints
  async fetchDossier() {
    return request(`${TASKS_URL}/dossier`, {
      headers: getHeaders(false),
    });
  },

  async fetchWeeklyReport() {
    return request(`${TASKS_URL}/weekly-report`, {
      headers: getHeaders(false),
    });
  },

  async fetchTrendAnalysis() {
    return request(`${TASKS_URL}/trends`, {
      headers: getHeaders(false),
    });
  },

  async fetchTasks() {
    return request(`${TASKS_URL}/prioritized-list`, {
      headers: getHeaders(false),
    });
  },

  async completeTask(taskId, actualMinutes) {
    return request(`${TASKS_URL}/complete/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ actualMinutes: Number(actualMinutes) }),
    });
  },

  async addSmartTask(taskData) {
    return request(`${TASKS_URL}/add`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(taskData),
    });
  },

  async setUserGoal(goal) {
    return request(`${TASKS_URL}/set-goal`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ goal }),
    });
  },

  async fetchCoachAdvice({ strategy, prediction, trends }) {
    return request(`${TASKS_URL}/coach-advice`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ strategy, prediction, trends }),
    });
  },

  async fetchStrategyCoachAdvice({ strategy, prediction, trends, goal }) {
    return request(`${TASKS_URL}/strategy-coach`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ strategy, prediction, trends, goal }),
    });
  }
};
