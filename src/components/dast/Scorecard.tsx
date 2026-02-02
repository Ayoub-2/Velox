import React from 'react';

interface ScorecardProps {
    stats: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
}

export const Scorecard: React.FC<ScorecardProps> = ({ stats }) => {
    // Grade Logic
    let grade = 'A';
    let color = 'text-emerald-400';
    let subtext = 'Excellent Security Posture';
    let bg = 'bg-emerald-500/10 border-emerald-500/20';

    if (stats.critical > 0) {
        grade = 'F';
        color = 'text-red-500';
        subtext = 'Critical Vulnerabilities Detected';
        bg = 'bg-red-500/10 border-red-500/20';
    } else if (stats.high > 0) {
        grade = 'D';
        color = 'text-orange-500';
        subtext = 'High Risk Issues Found';
        bg = 'bg-orange-500/10 border-orange-500/20';
    } else if (stats.medium > 5) {
        grade = 'C';
        color = 'text-yellow-400';
        subtext = 'Needs Improvement';
        bg = 'bg-yellow-400/10 border-yellow-400/20';
    } else if (stats.medium > 0 || stats.low > 0) {
        grade = 'B';
        color = 'text-blue-400';
        subtext = 'Good, but has minor issues';
        bg = 'bg-blue-400/10 border-blue-400/20';
    }

    return (
        <div className={`rounded-xl border p-6 ${bg} flex items-center justify-between mb-8`}>
            <div>
                <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-1">Security Grade</h3>
                <div className={`text-6xl font-black ${color}`}>{grade}</div>
            </div>
            
            <div className="text-right">
                 <div className={`text-xl font-bold ${color} mb-2`}>{subtext}</div>
                 <div className="text-slate-400 text-sm max-w-xs">
                    Based on the severity and count of current findings. A failing grade (D or F) requires immediate remediation.
                 </div>
            </div>

            {/* Mini Stats Legend */}
            <div className="hidden md:flex gap-4 border-l border-slate-700 pl-8 ml-8">
                <div className="text-center">
                    <div className="text-xl font-bold text-red-500">{stats.critical}</div>
                    <div className="text-xs text-slate-500">Critical</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-orange-500">{stats.high}</div>
                    <div className="text-xs text-slate-500">High</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{stats.medium}</div>
                    <div className="text-xs text-slate-500">Med</div>
                </div>
            </div>
        </div>
    );
};
