const BASE_URL = '/api/tasks';

export const api = {
  async fetchDossier() {
    const response = await fetch(`${BASE_URL}/dossier`);
    if (!response.ok) throw new Error('Failed to fetch student dossier');
    return response.json();
  },

  async fetchWeeklyReport() {
    const response = await fetch(`${BASE_URL}/weekly-report`);
    if (!response.ok) throw new Error('Failed to fetch weekly report');
    return response.json();
  },

  async fetchTrendAnalysis() {
    const response = await fetch(`${BASE_URL}/trends`);
    if (!response.ok) throw new Error('Failed to fetch trend analysis');
    return response.json();
  },

  async fetchTasks() {
    const response = await fetch(`${BASE_URL}/prioritized-list`);
    if (!response.ok) throw new Error('Failed to fetch prioritized tasks');
    return response.json();
  },

  async completeTask(taskId, actualMinutes) {
    const response = await fetch(`${BASE_URL}/complete/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualMinutes: Number(actualMinutes) }),
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  },

  async addSmartTask(taskData) {
    const response = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create smart task');
    return response.json();
  },

  async setUserGoal(goal) {
    const response = await fetch(`${BASE_URL}/set-goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    if (!response.ok) throw new Error('Failed to save user goal');
    return response.json();
  },

  async fetchCoachAdvice({ strategy, prediction, trends }) {
    const response = await fetch(`${BASE_URL}/coach-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, prediction, trends }),
    });
    if (!response.ok) throw new Error('Failed to fetch coach advice');
    return response.json();
  },

  async fetchStrategyCoachAdvice({ strategy, prediction, trends, goal }) {
    const response = await fetch(`${BASE_URL}/strategy-coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, prediction, trends, goal }),
    });
    if (!response.ok) throw new Error('Failed to fetch strategy mentor advice');
    return response.json();
  }
};
