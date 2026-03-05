import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { listUsers, getAdminSecret, promoteCurrentUserWithSecret, promoteUserById, demoteUserById, deleteUserById } from '../lib/localAuth';

function TabButton({ active, onClick, children }) {
    return (
        <button onClick={onClick} className={`px-3 py-2 rounded ${active ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {children}
        </button>
    );
}

export default function Admin() {
    const { user } = useAuth();
    const [tab, setTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [adminInitialized, setAdminInitialized] = useState(Boolean(getAdminSecret()));
    const [secretInput, setSecretInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => { refreshUsers(); }, []);

    function refreshUsers() {
        setUsers(listUsers());
    }

    const handleInitAndPromote = async () => {
        setMessage(null);
        if (!secretInput || secretInput.length < 6) {
            setMessage({ type: 'error', text: 'Secret must be at least 6 characters' });
            return;
        }
        setLoading(true);
        try {
            await promoteCurrentUserWithSecret(secretInput, 'owner');
            setAdminInitialized(true);
            refreshUsers();
            setMessage({ type: 'success', text: 'Promoted to owner' });
        } catch (err) {
            setMessage({ type: 'error', text: err?.error || err?.message || 'Failed' });
        } finally { setLoading(false); }
    };

    const handlePromote = (id) => {
        try {
            promoteUserById(id, 'developer');
            refreshUsers();
            setMessage({ type: 'success', text: 'User promoted' });
        } catch (err) { setMessage({ type: 'error', text: err?.error || 'Failed' }); }
    };

    const handleDemote = (id) => {
        try {
            demoteUserById(id);
            refreshUsers();
            setMessage({ type: 'success', text: 'User demoted' });
        } catch (err) { setMessage({ type: 'error', text: err?.error || 'Failed' }); }
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this user? This action cannot be undone.')) return;
        try {
            deleteUserById(id);
            refreshUsers();
            setMessage({ type: 'success', text: 'User deleted' });
        } catch (err) { setMessage({ type: 'error', text: err?.error || 'Failed' }); }
    };

    if (!user) return <div className="p-6">Please login to access the admin panel.</div>;

    const isAdmin = (user.role === 'owner' || user.role === 'developer');

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Admin</h1>
                <div className="flex gap-2">
                    <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</TabButton>
                    <TabButton active={tab === 'users'} onClick={() => setTab('users')}>Users</TabButton>
                    <TabButton active={tab === 'content'} onClick={() => setTab('content')}>Content</TabButton>
                    <TabButton active={tab === 'media'} onClick={() => setTab('media')}>Media</TabButton>
                    <TabButton active={tab === 'settings'} onClick={() => setTab('settings')}>Settings</TabButton>
                </div>
            </div>

            {!isAdmin && !adminInitialized && (
                <div className="mb-6 max-w-lg p-4 border rounded">
                    <h2 className="font-semibold mb-2">Initialize Admin (first-time)</h2>
                    <p className="text-sm text-gray-600 mb-3">Set an admin secret and promote the currently logged-in account to Owner.</p>
                    <input type="password" value={secretInput} onChange={e => setSecretInput(e.target.value)} className="border px-3 py-2 rounded w-full mb-3" placeholder="Admin secret (min 6 chars)" />
                    <button disabled={loading} onClick={handleInitAndPromote} className="px-4 py-2 bg-amber-500 text-white rounded">{loading ? 'Working...' : 'Initialize & Promote Me'}</button>
                    {message && <div className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>{message.text}</div>}
                </div>
            )}

            {!isAdmin && adminInitialized && (
                <div className="p-4 border rounded text-yellow-800 bg-yellow-50">You do not have permission to view the admin panel.</div>
            )}

            {isAdmin && (
                <div>
                    {tab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 border rounded">
                                <div className="text-sm text-gray-500">Total Users</div>
                                <div className="text-2xl font-semibold">{users.length}</div>
                            </div>
                            <div className="p-4 border rounded">
                                <div className="text-sm text-gray-500">Owners</div>
                                <div className="text-2xl font-semibold">{users.filter(u => u.role === 'owner').length}</div>
                            </div>
                            <div className="p-4 border rounded">
                                <div className="text-sm text-gray-500">Developers</div>
                                <div className="text-2xl font-semibold">{users.filter(u => u.role === 'developer').length}</div>
                            </div>
                        </div>
                    )}

                    {tab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Role</th>
                                        <th className="px-4 py-2">Created</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-t">
                                            <td className="px-4 py-2">{u.full_name}</td>
                                            <td className="px-4 py-2">{u.email}</td>
                                            <td className="px-4 py-2">{u.role}</td>
                                            <td className="px-4 py-2">{new Date(u.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    {u.role !== 'developer' && <button onClick={() => handlePromote(u.id)} className="px-2 py-1 bg-amber-500 text-white rounded text-sm">Promote</button>}
                                                    {u.role !== 'user' && <button onClick={() => handleDemote(u.id)} className="px-2 py-1 bg-gray-200 rounded text-sm">Demote</button>}
                                                    <button onClick={() => handleDelete(u.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === 'content' && (
                        <div className="p-4 border rounded">Content manager placeholder — implement CRUD here.</div>
                    )}

                    {tab === 'media' && (
                        <div className="p-4 border rounded">Media library placeholder — implement uploads and listing here.</div>
                    )}

                    {tab === 'settings' && (
                        <div className="p-4 border rounded">
                            <h3 className="font-medium mb-2">Admin Settings</h3>
                            <p className="text-sm text-gray-600">Environment-managed admins (VITE_ADMIN_EMAILS) and admin-secret initialization are supported.</p>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
