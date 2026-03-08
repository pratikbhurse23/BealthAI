import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../lib/localAuth';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Lock, Eye, EyeOff, HeartPulse } from 'lucide-react';

const DIET_OPTIONS = [
    { value: "Veg", label: "🥦 Veg" },
    { value: "Non-Veg", label: "🍗 Non-Veg" },
    { value: "Vegan", label: "🌿 Vegan" },
    { value: "Jain", label: "🙏 Jain" },
];

const MEDICAL_OPTIONS = [
    { key: "diabetes", label: "🩸 Diabetes" },
    { key: "hypertension", label: "💊 Hypertension" },
    { key: "heart", label: "❤️ Heart" },
    { key: "thyroid", label: "🦋 Thyroid" },
    { key: "pcos", label: "🌸 PCOS" },
    { key: "kidney", label: "🫘 Kidney" },
];

export default function Signup() {
    const nav = useNavigate();
    const [form, setForm] = useState({
        full_name: '', mobile_number: '', email: '',
        password: '', confirm: '',
        age: '', gender: 'Male', height: '', weight: '',
        activity_level: 'Sedentary',
        diet_preference: 'Veg',
        disability_notes: '',
    });
    const [medicalConditions, setMedicalConditions] = useState({
        diabetes: false, hypertension: false, heart: false,
        thyroid: false, pcos: false, kidney: false,
    });
    const [showPw, setShowPw] = useState(false);
    const [showCnf, setShowCnf] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleMed = (key) => setMedicalConditions(prev => ({ ...prev, [key]: !prev[key] }));

    const doSignup = async () => {
        setError('');
        if (!form.full_name || !form.mobile_number || !form.email || !form.password)
            return setError('Please fill in all required fields.');
        if (form.password.length < 8) return setError('Password must be at least 8 characters.');
        if (form.password !== form.confirm) return setError('Passwords do not match.');
        setLoading(true);
        try {
            const medArr = Object.entries(medicalConditions)
                .filter(([, v]) => v).map(([k]) => k);
            const medString = [
                ...medArr,
                form.disability_notes.trim() ? `other: ${form.disability_notes.trim()}` : '',
            ].filter(Boolean).join(', ');

            await signup({ ...form, medical_condition: medString });
            nav('/');
        } catch (err) {
            setError(err?.error || err?.message || 'Signup failed');
        } finally { setLoading(false); }
    };

    const submit = (e) => { e?.preventDefault(); doSignup(); };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/60 via-white to-amber-50/60 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 flex items-start justify-center py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                        <p className="text-xs text-gray-400">Fill in your details to get started</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">

                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basic Info</p>

                        <Field icon={<User className="w-4 h-4" />} placeholder="Full Name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                        <Field icon={<Phone className="w-4 h-4" />} placeholder="Mobile Number *" value={form.mobile_number} onChange={e => set('mobile_number', e.target.value)} type="tel" />
                        <Field icon={<Mail className="w-4 h-4" />} placeholder="Email *" value={form.email} onChange={e => set('email', e.target.value)} type="email" />

                        <div className="flex gap-2">
                            <PasswordField
                                placeholder="Password *"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                show={showPw}
                                toggleShow={() => setShowPw(p => !p)}
                            />
                            <PasswordField
                                placeholder="Confirm *"
                                value={form.confirm}
                                onChange={e => set('confirm', e.target.value)}
                                show={showCnf}
                                toggleShow={() => setShowCnf(p => !p)}
                            />
                        </div>
                    </div>

                    {/* Physical Details Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Physical Details</p>

                        <div className="grid grid-cols-3 gap-2">
                            <InputBox type="number" placeholder="Age" value={form.age} onChange={e => set('age', e.target.value)} />
                            <select value={form.gender} onChange={e => set('gender', e.target.value)}
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700">
                                <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                            <select value={form.activity_level} onChange={e => set('activity_level', e.target.value)}
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700">
                                <option>Sedentary</option>
                                <option>Lightly Active</option>
                                <option>Moderately Active</option>
                                <option>Very Active</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <InputBox type="number" placeholder="Height (cm)" value={form.height} onChange={e => set('height', e.target.value)} />
                            <InputBox type="number" placeholder="Weight (kg)" value={form.weight} onChange={e => set('weight', e.target.value)} />
                        </div>

                        {/* Diet Preference */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Diet Preference</p>
                            <div className="grid grid-cols-4 gap-2">
                                {DIET_OPTIONS.map(d => (
                                    <button key={d.value} type="button" onClick={() => set('diet_preference', d.value)}
                                        className={`py-2 rounded-xl border text-xs font-semibold transition-all min-h-[40px] ${form.diet_preference === d.value
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-400'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-200'
                                            }`}>{d.label}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Health Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <HeartPulse className="w-4 h-4 text-red-400" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Health</p>
                            <span className="text-xs text-gray-400 ml-auto">(optional)</span>
                        </div>

                        {/* Medical condition chips */}
                        <div className="grid grid-cols-3 gap-2">
                            {MEDICAL_OPTIONS.map(c => (
                                <button key={c.key} type="button" onClick={() => toggleMed(c.key)}
                                    className={`py-2 rounded-xl border text-xs font-semibold transition-all min-h-[40px] ${medicalConditions[c.key]
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-400'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-200'
                                        }`}>{c.label}</button>
                            ))}
                        </div>

                        {/* Disability / other — free text */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Disability / Other Condition
                            </p>
                            <textarea
                                rows={2}
                                placeholder="e.g. visual impairment, leg disability, chronic back pain…"
                                value={form.disability_notes}
                                onChange={e => set('disability_notes', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} onClick={doSignup}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-60">
                        {loading ? 'Creating account…' : 'Create Account →'}
                    </button>

                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <button type="button" onClick={() => nav('/Login')} className="text-amber-600 font-semibold hover:underline">
                            Login
                        </button>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}

/* ─── Field helpers ─────────────────────────────────────────────────── */

function Field({ icon, placeholder, value, onChange, type = 'text' }) {
    return (
        <div className="flex items-center gap-2.5 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-amber-300 dark:focus-within:ring-amber-700 transition-all">
            <span className="text-gray-400 flex-shrink-0">{icon}</span>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="flex-1 text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400"
            />
        </div>
    );
}

function PasswordField({ placeholder, value, onChange, show, toggleShow }) {
    return (
        <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-amber-300 dark:focus-within:ring-amber-700 transition-all">
            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="flex-1 text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400 min-w-0"
            />
            <button type="button" onClick={toggleShow} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}

function InputBox({ type = 'text', placeholder, value, onChange }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700"
        />
    );
}
