'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ScanResponse } from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Shield, AlertCircle, Activity, Zap } from 'lucide-react';

// Force rebuild: Icon fix
export default function DastPage() {
    const [target, setTarget] = useState('');
    const [scanType, setScanType] = useState('nuclei');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [authHeaders, setAuthHeaders] = useState<{ key: string, value: string }[]>([{ key: '', value: '' }]);
    const [scans, setScans] = useState<ScanResponse[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [trend, setTrend] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        loadData();
        // Check Admin Status
        if (typeof window !== 'undefined') {
            setIsAdmin(localStorage.getItem('isAdmin') === 'true');
        }

        const interval = setInterval(loadData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [scansData, statsData, trendData] = await Promise.all([
                apiClient.getScans(),
                apiClient.getDashboardStats().catch(() => null),
                apiClient.getFindingTrend().catch(() => [])
            ]);

            setScans(scansData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            setStats(statsData);
            setTrend(trendData);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddHeader = () => {
        setAuthHeaders([...authHeaders, { key: '', value: '' }]);
    };

    const handleHeaderChange = (index: number, field: 'key' | 'value', val: string) => {
        const newHeaders = [...authHeaders];
        newHeaders[index][field] = val;
        setAuthHeaders(newHeaders);
    };

    const handleRemoveHeader = (index: number) => {
        setAuthHeaders(authHeaders.filter((_, i) => i !== index));
    };

    const handleStartScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        // Prepare Headers
        const headers: Record<string, string> = {};
        authHeaders.forEach(h => {
            if (h.key.trim() && h.value.trim()) {
                headers[h.key.trim()] = h.value.trim();
            }
        });

        try {
            const result = await apiClient.triggerScan(target, scanType, {
                auth_headers: Object.keys(headers).length > 0 ? headers : undefined
            });
            setMsg(`Scan started with ID: ${result.id}`);

            // Unified Workflow: Redirect to results immediately
            router.push(`/dast/${result.id}`);

        } catch (e) {
            const err = e as Error;
            setMsg(`Error starting scan: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Velox DAST Orchestrator</h1>
                    <p className="text-slate-600 dark:text-slate-400">Enterprise-grade security scanning & vulnerability management.</p>
                </div>

                {isAdmin && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total Scans</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_scans}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-red-500/20 rounded-lg text-red-600 dark:text-red-500">
                                <Shield size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Critical Risks</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.findings?.critical || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-500">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">High Risks</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.findings?.high || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-500">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Active Targets</p>
                                {/* Mock for now or add to stats API */}
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">--</p>
                            </div>
                        </div>
                    </div>
                )}

                {isAdmin && trend.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Trend Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                            <h3 className="text-slate-900 dark:text-white font-bold mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                                Vulnerability Trend (7 Days)
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trend}>
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                                        <Bar dataKey="high" name="High" fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Severity Distribution */}
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                            <h3 className="text-slate-900 dark:text-white font-bold mb-6">Risk Distribution</h3>
                            <div className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Critical', value: stats?.findings?.critical || 0, color: '#ef4444' },
                                                { name: 'High', value: stats?.findings?.high || 0, color: '#f97316' },
                                                { name: 'Medium', value: stats?.findings?.medium || 0, color: '#eab308' },
                                                { name: 'Low', value: stats?.findings?.low || 0, color: '#3b82f6' },
                                            ].filter(x => x.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Critical', value: stats?.findings?.critical || 0, color: '#ef4444' },
                                                { name: 'High', value: stats?.findings?.high || 0, color: '#f97316' },
                                                { name: 'Medium', value: stats?.findings?.medium || 0, color: '#eab308' },
                                                { name: 'Low', value: stats?.findings?.low || 0, color: '#3b82f6' },
                                            ].filter(x => x.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scan Form */}
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-8 mb-12 shadow-lg backdrop-blur-sm">
                    <form onSubmit={handleStartScan} className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target URL</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="http://web:3000"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={target}
                                    onChange={e => setTarget(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Scan Mode</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={scanType}
                                    onChange={e => setScanType(e.target.value)}
                                >
                                    <option value="nuclei">Nuclei (Fast)</option>
                                    <option value="baseline">ZAP Baseline</option>
                                    <option value="full">ZAP Full Scan</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    w-full md:w-auto px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all
                                    ${loading ? 'bg-slate-600 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25'}
                                `}
                            >
                                {loading ? 'Starting...' : '🚀 Start Scan'}
                            </button>
                        </div>

                        {/* Advanced Options Toggle */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                            >
                                {showAdvanced ? '▼' : '▶'} Advanced Configuration
                            </button>
                        </div>

                        {/* Auth Configuration */}
                        {showAdvanced && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-500 dark:text-yellow-400">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                    Authentication Headers
                                </h3>
                                <div className="space-y-3">
                                    {authHeaders.map((header, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="Header (e.g. Authorization)"
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={header.key}
                                                onChange={e => handleHeaderChange(idx, 'key', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value (e.g. Bearer token...)"
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={header.value}
                                                onChange={e => handleHeaderChange(idx, 'value', e.target.value)}
                                            />
                                            {authHeaders.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveHeader(idx)}
                                                    className="text-slate-400 hover:text-red-500 px-2"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleAddHeader}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                                    >
                                        + Add Header
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-3">
                                    ⚠️ Headers are sent in plain text to the scanner. Ensure you are using HTTPS in production.
                                </p>
                            </div>
                        )}
                    </form>
                    {msg && (
                        <div className={`mt-4 text-center text-sm font-medium ${msg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                            {msg}
                        </div>
                    )}
                </div>

                {/* Recent Scans Table */}
                <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-900 dark:text-white">Recent Scans</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Target</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Findings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {scans.map(scan => (
                                    <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <Link href={`/dast/${scan.id}`} className="contents">
                                                <span className={`
                                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${scan.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                                                    ${scan.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' : ''}
                                                    ${scan.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                                                    ${scan.status === 'pending' ? 'bg-slate-700 text-slate-300' : ''}
                                                `}>
                                                    {scan.status}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                            <Link href={`/dast/${scan.id}`}>{scan.target_url}</Link>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm capitalize">
                                            <Link href={`/dast/${scan.id}`}>{scan.scan_type}</Link>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            <Link href={`/dast/${scan.id}`}>{new Date(scan.created_at).toLocaleString()}</Link>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            <Link href={`/dast/${scan.id}`}>
                                                {scan.status === 'completed' && scan.result ? (
                                                    <span className="font-mono text-xs text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-500">
                                                        {Array.isArray(scan.result) ? `${scan.result.length} Issues` : 'View Report'}
                                                    </span>
                                                ) : '-'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {scans.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                            No scans triggered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
