'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Shield, Search, RefreshCw, Calendar, User } from 'lucide-react';

interface AuditLog {
    id: string;
    username: string;
    action: string;
    details: string;
    createdAt: string;
}

export default function AdminPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterUser, setFilterUser] = useState('ALL');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiClient.getAuditLogs();
            setLogs(data);
            setFilteredLogs(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to retrieve audit logs. Make sure you are logged in as an Administrator.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = logs;

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(log => 
                (log.username && log.username.toLowerCase().includes(term)) ||
                (log.action && log.action.toLowerCase().includes(term)) ||
                (log.details && log.details.toLowerCase().includes(term))
            );
        }

        if (filterAction !== 'ALL') {
            result = result.filter(log => log.action === filterAction);
        }

        if (filterUser !== 'ALL') {
            result = result.filter(log => log.username === filterUser);
        }

        setFilteredLogs(result);
    }, [searchTerm, filterAction, filterUser, logs]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-50 dark:bg-slate-900">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Admin Access Required</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm">
                    Only authorized administrators have permission to access the portal audit trails.
                </p>
            </div>
        );
    }

    const uniqueUsers = Array.from(new Set(logs.map(log => log.username))).filter(Boolean);
    const uniqueActions = Array.from(new Set(logs.map(log => log.action))).filter(Boolean);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Admin Operations Portal</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Real-time security auditing and transaction trail monitoring.
                        </p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm transition-all"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh Logs
                    </button>
                </div>

                {/* Filters Panel */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8 shadow-sm backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Search Logs</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Filter by user, action, detail..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                                />
                                <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                            </div>
                        </div>

                        {/* Action Filter */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Action Type</label>
                            <select
                                value={filterAction}
                                onChange={e => setFilterAction(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                            >
                                <option value="ALL">All Actions</option>
                                {uniqueActions.map(action => (
                                    <option key={action} value={action}>{action}</option>
                                ))}
                            </select>
                        </div>

                        {/* User Filter */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">User</label>
                            <select
                                value={filterUser}
                                onChange={e => setFilterUser(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                            >
                                <option value="ALL">All Users</option>
                                {uniqueUsers.map(user => (
                                    <option key={user} value={user}>{user}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                            <span className="text-sm text-slate-400">Loading audit trail...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 px-6">
                            <p className="text-red-500 font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-850">
                                    <tr>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
                                    {filteredLogs.map(log => {
                                        const isDlpBlock = log.action && log.action.includes('DLP_BLOCKED');
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-800/10 transition-colors">
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                    <span className="flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                    <span className="flex items-center gap-2">
                                                        <User size={14} className="text-slate-400" />
                                                        {log.username}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`
                                                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
                                                        ${isDlpBlock ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' : ''}
                                                        ${log.action === 'TRIGGER_SCAN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                                                        ${log.action === 'EXPORT_REPORT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                                                        ${log.action === 'VIEW_KB' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : ''}
                                                        ${log.action && log.action.includes('CHAT_PROCESSED') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : ''}
                                                        ${!isDlpBlock && log.action !== 'TRIGGER_SCAN' && log.action !== 'EXPORT_REPORT' && log.action !== 'VIEW_KB' && !(log.action && log.action.includes('CHAT_PROCESSED')) ? 'bg-slate-700 text-slate-300 dark:bg-slate-850' : ''}
                                                    `}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs max-w-md break-all">
                                                    {log.details}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                                No audit logs match the current search filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
