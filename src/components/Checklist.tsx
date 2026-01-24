'use client';

import { useState, useEffect } from 'react';
import { ChecklistData } from '@/data/checklists';

interface ChecklistProps {
    data: ChecklistData;
}

export default function Checklist({ data }: ChecklistProps) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [progress, setProgress] = useState(0);

    // Load state from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(`checklist_${data.id}`);
        if (saved) {
            setCheckedItems(JSON.parse(saved));
        }
    }, [data.id]);

    // Save state and calc progress
    useEffect(() => {
        localStorage.setItem(`checklist_${data.id}`, JSON.stringify(checkedItems));

        const total = data.items.length;
        const checkedCount = Object.values(checkedItems).filter(Boolean).length;
        setProgress(Math.round((checkedCount / total) * 100));
    }, [checkedItems, data.id, data.items.length]);

    const toggleItem = (itemId: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const resetChecklist = () => {
        if (confirm('Are you sure you want to reset this checklist?')) {
            setCheckedItems({});
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{data.title}</h3>
                    <p className="text-slate-400 text-sm">{data.description}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-blue-400">{progress}%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Complete</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Items */}
            <div className="space-y-3">
                {data.items.map(item => (
                    <label
                        key={item.id}
                        className={`
                            flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group
                            ${checkedItems[item.id]
                                ? 'bg-blue-500/5 border-blue-500/20'
                                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'}
                        `}
                    >
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={!!checkedItems[item.id]}
                                onChange={() => toggleItem(item.id)}
                            />
                            <div className={`
                                w-5 h-5 rounded border flex items-center justify-center transition-all
                                ${checkedItems[item.id]
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'bg-slate-800 border-slate-600 group-hover:border-slate-500'}
                            `}>
                                <svg className={`w-3.5 h-3.5 transition-transform ${checkedItems[item.id] ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className={`font-medium transition-colors ${checkedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                                {item.text}
                                {item.critical && (
                                    <span className="ml-2 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                        Critical
                                    </span>
                                )}
                            </div>
                            {item.description && (
                                <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                            )}
                        </div>
                    </label>
                ))}
            </div>

            {progress > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-end">
                    <button
                        onClick={resetChecklist}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                        Reset Progress
                    </button>
                </div>
            )}
        </div>
    );
}
