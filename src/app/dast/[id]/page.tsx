'use client';

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient, ScanResponse } from '@/lib/api';
import { Scorecard } from '@/components/dast/Scorecard';
import { KBLink } from '@/components/dast/KBLink';

export default function ScanDetailsPage() {
    const params = useParams();
    const id = params?.id as string;

    const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
    const buildApiUrl = (path: string) => `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

    const [scan, setScan] = useState<ScanResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadScan(id);
        }
    }, [id]);

    // Auto-Download Effect
    useEffect(() => {
        if (scan?.status === 'completed' && scan.result && !localStorage.getItem(`downloaded_${scan.id}`)) {
            // Allow time for component to render "Completed" state visually before redirecting/downloading
            const timer = setTimeout(() => {
                downloadReport(scan.id);
                localStorage.setItem(`downloaded_${scan.id}`, 'true');
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [scan?.status, scan?.id]);

    const downloadReport = async (scanId: string) => {
        try {
            const token = localStorage.getItem('velox_access_token');
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(buildApiUrl(`/scans/${scanId}/export`), {
                headers
            });
            if (!res.ok) throw new Error('Failed to download report');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scan_report_${scanId}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error downloading report:', e);
        }
    };

    const loadScan = async (scanId: string) => {
        try {
            const data = await apiClient.getScan(scanId);
            setScan(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load scan details');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !scan) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <h2 className="text-xl font-bold text-red-500 mb-4">{error || 'Scan not found'}</h2>
                <Link to="/dast" className="text-blue-400 hover:text-blue-300">
                    &larr; Back to Dashboard
                </Link>
            </div>
        );
    }

    // Calculate Stats for Scorecard
    const stats = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    if (scan.result) {
        scan.result.forEach((f: any) => {
            const s = (f.info?.severity || f.risk || 'info').toLowerCase();
            if (s === 'critical') stats.critical++;
            else if (s === 'high') stats.high++;
            else if (s === 'medium') stats.medium++;
            else if (s === 'low') stats.low++;
            else stats.info++;
        });
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/dast" className="text-slate-400 hover:text-white mb-4 inline-block transition-colors">
                        &larr; Back to Scans
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-white mb-2">Scan Results</h1>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="font-mono bg-slate-800 px-2 py-1 rounded">{scan.target_url}</span>
                                        <span>•</span>
                                        <span className="capitalize">{scan.scan_type}</span>
                                        <span>•</span>
                                        <span>{new Date(scan.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                {scan.status === 'completed' && scan.result && scan.result.length > 0 && (
                                        <button
                                            onClick={() => downloadReport(scan.id)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                            Download Report
                                        </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scorecard (Only for completed scans) */}
                {scan.status === 'completed' && (
                    <Scorecard stats={stats} />
                )}

                {/* Findings Table */}
                <div className="bg-slate-800/30 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-bold text-white">Vulnerability Report</h3>
                        <span className="text-slate-400 text-sm">
                            {scan.result ? Array.isArray(scan.result) ? scan.result.length : 0 : 0} Findings
                        </span>
                    </div>

                    {scan.status === 'failed' ? (
                        <div className="p-12 text-center">
                            <div className="text-red-500 mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <p className="text-slate-300 font-medium text-lg">Scan Failed</p>
                            <p className="text-slate-500">The scan could not be completed. Please check the orchestrator logs.</p>
                        </div>
                    ) : (scan.status === 'pending' || scan.status === 'running') ? (
                        <div className="p-12 text-center">
                            <div className="text-blue-500 mb-4 flex justify-center">
                                <svg className="animate-spin w-16 h-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <p className="text-slate-300 font-medium text-lg capitalize">{scan.status}...</p>
                            <p className="text-slate-500">The scan is currently in progress. Please wait.</p>
                        </div>
                    ) : !scan.result || (Array.isArray(scan.result) && scan.result.length === 0) ? (
                        <div className="p-12 text-center">
                            <div className="text-green-400 mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <p className="text-slate-300 font-medium text-lg">No vulnerabilities found.</p>
                            <p className="text-slate-500">Good job! Your target appears secure against this scan.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold">
                                    <tr>
                                        <th className="px-6 py-3 border-b border-slate-700">Severity</th>
                                        <th className="px-6 py-3 border-b border-slate-700">Issue / Template</th>
                                        <th className="px-6 py-3 border-b border-slate-700">Affected Locations</th>
                                        <th className="px-6 py-3 border-b border-slate-700">Remediation / Info</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {(() => {
                                        // SMART GROUPING LOGIC
                                        // Group results by Name + Severity to avoid listing 200+ duplicates
                                        const groups: Record<string, any> = {};

                                        (scan.result || []).forEach((finding: any) => {
                                            const name = finding.info?.name || finding.alert || finding.template || 'Unknown Issue';
                                            const severity = (finding.info?.severity || finding.risk || 'info').toLowerCase();
                                            const key = `${name}-${severity}`;

                                            if (!groups[key]) {
                                                groups[key] = {
                                                    ...finding,
                                                    _severity: severity,
                                                    _name: name,
                                                    _count: 0,
                                                    _urls: new Set()
                                                };
                                            }
                                            groups[key]._count++;
                                            const url = finding['matched-at'] || finding.url || '-';
                                            groups[key]._urls.add(url);
                                        });

                                        return Object.values(groups).map((group, idx) => {
                                            let severityColor = 'text-slate-400 bg-slate-800/50';
                                            if (group._severity === 'critical') severityColor = 'text-red-500 bg-red-500/10 border-red-500/20';
                                            else if (group._severity === 'high') severityColor = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
                                            else if (group._severity === 'medium') severityColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
                                            else if (group._severity === 'low') severityColor = 'text-blue-400 bg-blue-400/10 border-blue-400/20';

                                            const uniqueUrls = Array.from(group._urls as Set<string>);

                                            return (
                                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-6 py-4 align-top w-32">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase border ${severityColor}`}>
                                                            {group._severity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="font-medium text-slate-200">
                                                            {group._name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-mono mt-1">
                                                            {(group['template-id'] || group.pluginid)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top w-1/4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                                {group._count}
                                                            </span>
                                                            <span className="text-xs text-slate-400">instances</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-mono break-all max-h-20 overflow-y-auto pr-2 custom-scrollbar">
                                                            {uniqueUrls.slice(0, 3).map((url, i) => (
                                                                <div key={i} className="mb-0.5">{url}</div>
                                                            ))}
                                                            {uniqueUrls.length > 3 && (
                                                                <div className="text-slate-600 italic">
                                                                    + {uniqueUrls.length - 3} more...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top w-1/3">
                                                        {group.solution ? (
                                                            <div className="text-sm">
                                                                <div className="font-semibold text-emerald-400 mb-1 text-xs uppercase tracking-wide">Solution</div>
                                                                <div className="text-slate-300 text-xs leading-relaxed opacity-90">
                                                                    {group.solution}
                                                                </div>
                                                            </div>
                                                        ) : group['extracted-results'] ? (
                                                            <code className="text-xs bg-black/30 rounded px-2 py-1 text-emerald-400 font-mono block overflow-hidden text-ellipsis max-w-xs">
                                                                {Array.isArray(group['extracted-results'])
                                                                    ? group['extracted-results'].join(', ')
                                                                    : group['extracted-results']}
                                                            </code>
                                                        ) : (
                                                            <div className="text-xs text-slate-500 italic">No specific remediation available</div>
                                                        )}

                                                        {/* Recommendation Link */}
                                                        <KBLink query={group._name} />
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

