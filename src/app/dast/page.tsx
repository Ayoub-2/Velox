'use client';

import { useState, useEffect } from 'react';
import { apiClient, ScanResponse } from '@/lib/api';

export default function DastPage() {
    const [target, setTarget] = useState('');
    const [scanType, setScanType] = useState('nuclei');
    const [scans, setScans] = useState<ScanResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        loadScans();
        const interval = setInterval(loadScans, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const loadScans = async () => {
        try {
            const data = await apiClient.getScans();
            // Sort by newest first
            setScans(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (e) {
            console.error(e);
        }
    };

    const handleStartScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const result = await apiClient.triggerScan(target, scanType);
            setMsg(`Scan started with ID: ${result.id}`);
            loadScans();
            setTarget('');
        } catch (e) {
            setMsg('Error starting scan. Is the orchestrator running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-white mb-2">DAST Orchestrator</h1>
                    <p className="text-slate-400">Trigger security scans against your targets.</p>
                </div>

                {/* Scan Form */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-12 shadow-lg backdrop-blur-sm">
                    <form onSubmit={handleStartScan} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Target URL</label>
                            <input
                                type="url"
                                required
                                placeholder="http://web:3000"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={target}
                                onChange={e => setTarget(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                💡 Docker Tip: Use <code className="text-slate-400">http://web:3000</code> to scan this app internally.
                            </p>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Scan Mode</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={scanType}
                                onChange={e => setScanType(e.target.value)}
                            >
                                <option value="nuclei">Nuclei (Fast)</option>
                                <option value="baseline">ZAP Baseline</option>
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
                    </form>
                    {msg && (
                        <div className={`mt-4 text-center text-sm font-medium ${msg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                            {msg}
                        </div>
                    )}
                </div>

                {/* Recent Scans Table */}
                <div className="bg-slate-800/30 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50">
                        <h3 className="font-bold text-white">Recent Scans</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Target</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Findings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {scans.map(scan => (
                                    <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`
                                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${scan.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                                                ${scan.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' : ''}
                                                ${scan.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                                                ${scan.status === 'pending' ? 'bg-slate-700 text-slate-300' : ''}
                                            `}>
                                                {scan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-medium">{scan.target_url}</td>
                                        <td className="px-6 py-4 text-slate-400 text-sm capitalize">{scan.scan_type}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(scan.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {scan.status === 'completed' && scan.result ? (
                                                <span className="font-mono text-xs">
                                                    {Array.isArray(scan.result) ? `${scan.result.length} Issues` : 'View Report'}
                                                </span>
                                            ) : '-'}
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
