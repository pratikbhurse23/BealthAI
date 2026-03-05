// Minimal local auth using Web Crypto + localStorage
const USERS_KEY = 'local_users_v1';
const CURRENT_USER_KEY = 'currentUser';
const ADMIN_SECRET_KEY = 'admin_secret_v1';

// Emails listed in VITE_ADMIN_EMAILS (comma separated) will be auto-promoted
const ADMIN_EMAILS = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_EMAILS)
    ? String(import.meta.env.VITE_ADMIN_EMAILS).split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

function toHex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    return bytes.buffer;
}

async function pbkdf2Hash(password, saltHex) {
    const enc = new TextEncoder();
    const pwKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const salt = saltHex ? new Uint8Array(fromHex(saltHex)) : crypto.getRandomValues(new Uint8Array(16));
    const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, pwKey, 256);
    return { hash: toHex(derived), salt: toHex(salt) };
}

function loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}

function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

export async function signup(data) {
    const { full_name, mobile_number, email, password, age, gender, height, weight, activity_level, medical_condition, diet_preference } = data;
    if (!full_name || !mobile_number || !email || !password) throw { error: 'Missing required fields' };
    // basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw { error: 'Invalid email' };
    if (password.length < 8) throw { error: 'Password too weak' };

    const users = loadUsers();
    if (users.find(u => u.email === email || u.mobile_number === mobile_number)) throw { error: 'Email or mobile already registered' };

    const { hash, salt } = await pbkdf2Hash(password);
    const id = Date.now().toString(36);
    const normalizedEmail = email.toLowerCase();
    const initialRole = ADMIN_EMAILS.includes(normalizedEmail) ? 'owner' : 'user';
    const user = { id, full_name, mobile_number, email: normalizedEmail, role: initialRole, password_hash: hash, salt, created_at: new Date().toISOString(), profile: { age: age || null, gender: gender || null, height: height || null, weight: weight || null, activity_level: activity_level || null, medical_condition: medical_condition || null, diet_preference: diet_preference || null } };
    users.push(user);
    saveUsers(users);
    // also create a UserProfile record used by the app's local API
    try {
        // dynamic import to avoid potential circular issues
        const { api } = await import('../api/client');
        const activityNorm = (activity_level || '').toString().toLowerCase();
        const activity = activityNorm.includes('sedentary') ? 'sedentary' : activityNorm.includes('active') ? 'active' : 'sedentary';
        const profileData = {
            created_by: normalizedEmail,
            age: age ? parseFloat(age) : null,
            gender: gender || null,
            weight_kg: weight ? parseFloat(weight) : null,
            height_cm: height ? parseFloat(height) : null,
            activity_level: activity,
            weight_goal: null,
            goal_weight_kg: null,
            start_weight_kg: weight ? parseFloat(weight) : null,
            medical_conditions: medical_condition ? JSON.stringify({ note: medical_condition }) : JSON.stringify({}),
        };
        await api.entities.UserProfile.create(profileData);
    } catch (e) {
        // non-fatal
        console.warn('Failed to create user profile in local API', e);
    }
    // store current user (without password) as logged in
    const publicUser = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));
    return publicUser;
}

export async function login(email, password) {
    const users = loadUsers();
    const normalizedEmail = email.toLowerCase();
    const user = users.find(u => u.email === normalizedEmail);
    if (!user) throw { error: 'Invalid credentials' };
    const { hash } = await pbkdf2Hash(password, user.salt);
    if (hash !== user.password_hash) throw { error: 'Invalid credentials' };
    // auto-promote if login email is listed in env
    if (ADMIN_EMAILS.includes(normalizedEmail) && user.role !== 'owner') {
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx].role = 'owner';
            saveUsers(users);
            user.role = 'owner';
        }
    }

    const publicUser = { id: user.id, full_name: user.full_name, email: user.email, role: user.role || 'user' };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));
    return publicUser;
}

export function logout() { localStorage.removeItem(CURRENT_USER_KEY); }

export function me() { try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch { return null; } }

export function getAdminSecret() { try { return localStorage.getItem(ADMIN_SECRET_KEY); } catch { return null; } }

export function setAdminSecret(secret) { if (!secret) return false; try { localStorage.setItem(ADMIN_SECRET_KEY, secret); return true; } catch { return false; } }

export async function promoteCurrentUserWithSecret(secret, role = 'owner') {
    const stored = getAdminSecret();
    // if no secret initialized, require the incoming secret to be non-empty and initialize
    if (!stored) {
        // initialize secret and promote
        setAdminSecret(secret);
    } else if (stored !== secret) {
        throw { error: 'Invalid admin secret' };
    }

    const current = me();
    if (!current) throw { error: 'No logged in user' };
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) throw { error: 'User not found' };
    users[idx].role = role;
    saveUsers(users);
    const publicUser = { id: users[idx].id, full_name: users[idx].full_name, email: users[idx].email, role: users[idx].role };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));
    return publicUser;
}

// Return public-safe user list (no password hashes)
export function listUsers() {
    return loadUsers().map(u => ({ id: u.id, full_name: u.full_name, mobile_number: u.mobile_number, email: u.email, role: u.role || 'user', created_at: u.created_at, profile: u.profile || {} }));
}

export function promoteUserById(userId, role = 'developer') {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw { error: 'User not found' };
    users[idx].role = role;
    saveUsers(users);
    return { id: users[idx].id, full_name: users[idx].full_name, email: users[idx].email, role: users[idx].role };
}

export function demoteUserById(userId) {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw { error: 'User not found' };
    users[idx].role = 'user';
    saveUsers(users);
    return { id: users[idx].id, full_name: users[idx].full_name, email: users[idx].email, role: users[idx].role };
}

export function deleteUserById(userId) {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw { error: 'User not found' };
    const removed = users.splice(idx, 1)[0];
    saveUsers(users);
    // If deleted user was current logged in, clear current
    try {
        const current = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
        if (current && current.id === removed.id) {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    } catch { }
    return { id: removed.id, full_name: removed.full_name, email: removed.email };
}
