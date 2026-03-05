import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/localAuth';

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) return setError('Please enter email and password');
        setLoading(true);
        try {
            await login(email, password);
            nav('/');
        } catch (err) {
            setError(err?.error || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Login (local)</h2>
            {error && <div className="mb-3 text-red-600">{error}</div>}
            <form onSubmit={submit} className="space-y-3">
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded border" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded border" />
                <div className="flex items-center justify-between">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-500 text-white rounded">{loading ? 'Signing in...' : 'Login'}</button>
                    <button type="button" onClick={() => nav('/Signup')} className="text-sm">Create account</button>
                </div>
            </form>
        </div>
    );
}
