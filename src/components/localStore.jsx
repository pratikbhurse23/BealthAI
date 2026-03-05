// Local storage helpers — no database, no auth

const KEYS = {
  analyses: "nutriscan_analyses",
  calorieLogs: "nutriscan_calorie_logs",
  dietPlans: "nutriscan_diet_plans",
};

function getAll(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveAll(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Food Analyses
export const analysesStore = {
  list: () => getAll(KEYS.analyses).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
  add: (item) => {
    const all = getAll(KEYS.analyses);
    const newItem = { ...item, id: makeId(), created_date: new Date().toISOString() };
    saveAll(KEYS.analyses, [newItem, ...all]);
    return newItem;
  },
};

// Calorie Logs
export const calorieStore = {
  listByDate: (date) => getAll(KEYS.calorieLogs).filter((l) => l.log_date === date),
  listAll: () => getAll(KEYS.calorieLogs),
  add: (item) => {
    const all = getAll(KEYS.calorieLogs);
    const newItem = { ...item, id: makeId(), created_date: new Date().toISOString() };
    saveAll(KEYS.calorieLogs, [newItem, ...all]);
    return newItem;
  },
  delete: (id) => {
    const all = getAll(KEYS.calorieLogs).filter((l) => l.id !== id);
    saveAll(KEYS.calorieLogs, all);
  },
};

// Diet Plans
export const dietStore = {
  list: () => getAll(KEYS.dietPlans).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
  add: (item) => {
    const all = getAll(KEYS.dietPlans);
    const newItem = { ...item, id: makeId(), created_date: new Date().toISOString() };
    saveAll(KEYS.dietPlans, [newItem, ...all]);
    return newItem;
  },
  update: (id, patch) => {
    const all = getAll(KEYS.dietPlans).map((p) => (p.id === id ? { ...p, ...patch } : p));
    saveAll(KEYS.dietPlans, all);
  },
  delete: (id) => {
    saveAll(KEYS.dietPlans, getAll(KEYS.dietPlans).filter((p) => p.id !== id));
  },
};