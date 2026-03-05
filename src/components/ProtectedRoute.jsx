import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
    const { user, isLoadingAuth } = useAuth();

    if (isLoadingAuth) return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
    );

    if (!user) {
        return <Navigate to="/Login" replace />;
    }

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Access denied</h2>
                <p className="text-sm text-gray-600">You do not have permission to view this page.</p>
            </div>
        );
    }

    return children;
}
