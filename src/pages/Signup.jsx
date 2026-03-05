import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../lib/localAuth';

export default function Signup() {
    const nav = useNavigate();
    const [form, setForm] = useState({ full_name: '', mobile_number: '', email: '', password: '', confirm: '', age: '', gender: 'Male', height: '', weight: '', activity_level: 'Sedentary', medical_condition: '', diet_preference: 'Veg' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const doSignup = async () => {
        console.log('Signup action invoked')
        setError('');
        if (!form.full_name || !form.mobile_number || !form.email || !form.password) return setError('Please fill required fields');
        if (form.password.length < 8) return setError('Password must be at least 8 chars');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        setLoading(true);
        try {
            console.log('Calling local signup', { email: form.email })
            await signup(form);
            console.log('Signup success, navigating to /')
            nav('/');
        } catch (err) {
            console.error('Signup error', err);
            setError(err?.error || err?.message || 'Signup failed');
        } finally { setLoading(false); }
    };

    const submit = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        await doSignup();
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Create account (local)</h2>
            {error && <div className="mb-3 text-red-600">{error}</div>}
            <form onSubmit={submit} className="space-y-3">
                <input placeholder="Full Name" value={form.full_name} onChange={e => set('full_name', e.target.value)} className="w-full p-2 rounded border" />
                <input placeholder="Mobile Number" value={form.mobile_number} onChange={e => set('mobile_number', e.target.value)} className="w-full p-2 rounded border" />
                <input placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full p-2 rounded border" />
                <div className="flex gap-2">
                    <input type="password" placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} className="flex-1 p-2 rounded border" />
                    <input type="password" placeholder="Confirm" value={form.confirm} onChange={e => set('confirm', e.target.value)} className="flex-1 p-2 rounded border" />
                </div>
                <div className="flex gap-2">
                    <input placeholder="Age" value={form.age} onChange={e => set('age', e.target.value)} className="w-1/3 p-2 rounded border" />
                    <select value={form.gender} onChange={e => set('gender', e.target.value)} className="w-1/3 p-2 rounded border">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                    <select value={form.activity_level} onChange={e => set('activity_level', e.target.value)} className="w-1/3 p-2 rounded border">
                        <option>Sedentary</option>
                        <option>Lightly Active</option>
                        <option>Moderately Active</option>
                        <option>Very Active</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <input placeholder="Height (cm)" value={form.height} onChange={e => set('height', e.target.value)} className="flex-1 p-2 rounded border" />
                    <input placeholder="Weight (kg)" value={form.weight} onChange={e => set('weight', e.target.value)} className="flex-1 p-2 rounded border" />
                </div>
                <textarea placeholder="Medical condition" value={form.medical_condition} onChange={e => set('medical_condition', e.target.value)} className="w-full p-2 rounded border" />
                <select value={form.diet_preference} onChange={e => set('diet_preference', e.target.value)} className="w-full p-2 rounded border">
                    <option>Veg</option>
                    <option>Non-Veg</option>
                    <option>Vegan</option>
                    <option>Jain</option>
                </select>

                <div className="flex items-center justify-between">
                    <button type="submit" disabled={loading} onClick={doSignup} className="px-4 py-2 bg-amber-500 text-white rounded">{loading ? 'Creating...' : 'Sign up'}</button>
                    <button type="button" onClick={() => nav('/Login')} className="text-sm">Have an account? Login</button>
                </div>
            </form>
        </div>
    );
}
