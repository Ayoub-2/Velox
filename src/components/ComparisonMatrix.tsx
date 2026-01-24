'use client';

import { useState } from 'react';

export interface ComparisonData {
    id: string;
    title: string;
    description: string;
    rows: {
        feature: string;
        options: {
            [key: string]: string | boolean | 'High' | 'Medium' | 'Low' | 'Yes' | 'No';
        };
    }[];
    options: string[]; // e.g. ['JWT', 'Session', 'OAuth']
}

interface ComparisonMatrixProps {
    data: ComparisonData;
}

export default function ComparisonMatrix({ data }: ComparisonMatrixProps) {
    const [highlightedOption, setHighlightedOption] = useState<string | null>(null);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white mb-2">{data.title}</h3>
                <p className="text-slate-400 text-sm">{data.description}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50">
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-1/4">Feature</th>
                            {data.options.map(option => (
                                <th
                                    key={option}
                                    className={`
                                        p-4 text-sm font-bold text-white w-1/4 transition-colors cursor-default
                                        ${highlightedOption === option ? 'bg-blue-500/10 text-blue-300' : ''}
                                    `}
                                    onMouseEnter={() => setHighlightedOption(option)}
                                    onMouseLeave={() => setHighlightedOption(null)}
                                >
                                    {option}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 block md:table-row-group">
                        {data.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                                <td className="p-4 text-sm font-medium text-slate-300 border-r border-slate-800/50">{row.feature}</td>
                                {data.options.map(option => {
                                    const val = row.options[option];
                                    let content: React.ReactNode = val;
                                    let style = 'text-slate-400';

                                    if (typeof val === 'boolean') {
                                        content = val ? (
                                            <span className="inline-flex items-center text-green-400 gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-red-400 gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                No
                                            </span>
                                        );
                                    } else if (val === 'High') style = 'text-green-400 font-bold';
                                    else if (val === 'Medium') style = 'text-yellow-400 font-bold';
                                    else if (val === 'Low') style = 'text-red-400 font-bold';
                                    else if (val === 'Yes') style = 'text-green-400';
                                    else if (val === 'No') style = 'text-red-400';

                                    return (
                                        <td
                                            key={option}
                                            className={`
                                                p-4 text-sm transition-colors
                                                ${highlightedOption === option ? 'bg-blue-500/5' : ''}
                                                ${style}
                                            `}
                                            onMouseEnter={() => setHighlightedOption(option)}
                                            onMouseLeave={() => setHighlightedOption(null)}
                                        >
                                            {content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-800/30 border-t border-slate-800 text-xs text-slate-500 text-center">
                Hover over a column to highlight.
            </div>
        </div>
    );
}
