// local API stub replacing any external SDK (previously Base44)
// Provides the minimal interface used by the application.  Data is stored
// locally in localStorage so the UI continues to work without a remote backend.

const STORAGE_PROFILES_KEY = 'userProfiles';
const STORAGE_USER_KEY = 'currentUser';

function getProfiles() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_PROFILES_KEY) || '[]');
    } catch {
        return [];
    }
}
function saveProfiles(profiles) {
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
}

const UserProfile = {
    filter: async (query = {}) => {
        const all = getProfiles();
        return all.filter(p => {
            return Object.entries(query).every(([k, v]) => p[k] === v);
        });
    },
    update: async (id, data) => {
        const all = getProfiles();
        const idx = all.findIndex(p => p.id === id);
        if (idx === -1) throw new Error('Profile not found');
        all[idx] = { ...all[idx], ...data };
        saveProfiles(all);
        return all[idx];
    },
    create: async (data) => {
        const all = getProfiles();
        const id = Date.now().toString();
        const newProfile = { ...data, id };
        all.push(newProfile);
        saveProfiles(all);
        return newProfile;
    }
};

const auth = {
    me: async () => {
        const stored = localStorage.getItem(STORAGE_USER_KEY);
        if (stored) return JSON.parse(stored);
        const defaultUser = { email: 'guest@example.com' };
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(defaultUser));
        return defaultUser;
    },
    logout: (redirect) => {
        localStorage.removeItem(STORAGE_USER_KEY);
        if (redirect && typeof redirect === 'string') {
            window.location.href = redirect;
        }
    },
    redirectToLogin: (redirect) => {
        if (redirect && typeof redirect === 'string') {
            window.location.href = redirect;
        }
    }
};

const integrations = {
    Core: {
        InvokeLLM: async (opts = {}) => {
            // stubbed LLM: simply echo prompt or return empty structure
            const response = {};
            if (opts.response_json_schema) {
                // could try to craft fake values from schema
            }
            return response;
        },
        UploadFile: async ({ file }) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ file_url: reader.result });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    }
};

const appLogs = {
    logUserInApp: async () => {
        // no-op logging
    }
};

// export individual pieces plus a combined object for backwards compatibility.
export { auth, UserProfile, integrations, appLogs };
export const api = { auth, entities: { UserProfile }, integrations, appLogs };
