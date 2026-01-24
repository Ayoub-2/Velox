'use client';

import Link from 'next/link';
import { useStack } from '@/lib/stack-context';
import { DocData } from '@/lib/types';
import { useMemo } from 'react';

interface StackAwareArticleListProps {
    initialDocs: DocData[];
}

const getCategoryTheme = (category: string | undefined) => {
    const themes: Record<string, { border: string, hover_border: string, hover_bg: string, badge_bg: string, badge_text: string, badge_border: string }> = {
        'Authorization': {
            border: 'border-indigo-900/50',
            hover_border: 'group-hover:border-indigo-500/50',
            hover_bg: 'group-hover:bg-indigo-950/30',
            badge_bg: 'bg-indigo-900/30',
            badge_text: 'text-indigo-300',
            badge_border: 'border-indigo-800'
        },
        'Backend': {
            border: 'border-emerald-900/50',
            hover_border: 'group-hover:border-emerald-500/50',
            hover_bg: 'group-hover:bg-emerald-950/30',
            badge_bg: 'bg-emerald-900/30',
            badge_text: 'text-emerald-300',
            badge_border: 'border-emerald-800'
        },
        'Frontend': {
            border: 'border-pink-900/50',
            hover_border: 'group-hover:border-pink-500/50',
            hover_bg: 'group-hover:bg-pink-950/30',
            badge_bg: 'bg-pink-900/30',
            badge_text: 'text-pink-300',
            badge_border: 'border-pink-800'
        },
        'Operations': {
            border: 'border-purple-900/50',
            hover_border: 'group-hover:border-purple-500/50',
            hover_bg: 'group-hover:bg-purple-950/30',
            badge_bg: 'bg-purple-900/30',
            badge_text: 'text-purple-300',
            badge_border: 'border-purple-800'
        },
        'Configuration': {
            border: 'border-amber-900/50',
            hover_border: 'group-hover:border-amber-500/50',
            hover_bg: 'group-hover:bg-amber-950/30',
            badge_bg: 'bg-amber-900/30',
            badge_text: 'text-amber-300',
            badge_border: 'border-amber-800'
        },
        'Authentication': {
            border: 'border-blue-900/50',
            hover_border: 'group-hover:border-blue-500/50',
            hover_bg: 'group-hover:bg-blue-950/30',
            badge_bg: 'bg-blue-900/30',
            badge_text: 'text-blue-300',
            badge_border: 'border-blue-800'
        }
    };
    return themes[category || ''] || themes['Authorization'];
};

export default function StackAwareArticleList({ initialDocs }: StackAwareArticleListProps) {
    const { selectedStack } = useStack();

    const filteredDocs = useMemo(() => {
        if (selectedStack === 'All') return initialDocs;

        return initialDocs.filter(doc => {
            // Check tags for stack relevance
            const hasStackTag = doc.tags?.some(tag =>
                tag.toLowerCase() === selectedStack.toLowerCase()
            );

            // Allow some loose category matching as fallback
            const hasCategoryMatch = doc.category?.toLowerCase() === selectedStack.toLowerCase();

            return hasStackTag || hasCategoryMatch;
        });
    }, [initialDocs, selectedStack]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-200">
                    {selectedStack === 'All' ? 'All Security Patterns' : `${selectedStack} Security Patterns`}
                </h2>
                <span className="text-sm text-gray-400">
                    {filteredDocs.length} {filteredDocs.length === 1 ? 'article' : 'articles'} found
                </span>
            </div>

            {filteredDocs.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {filteredDocs.map((doc: DocData) => {
                        const theme = getCategoryTheme(doc.category);
                        return (
                            <Link
                                key={doc.id}
                                href={`/knowledge-base/${doc.id}`}
                                className={`flex flex-col rounded-xl border ${theme.border} bg-gray-900/50 backdrop-blur-sm p-4 sm:p-6 ${theme.hover_border} ${theme.hover_bg} transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
                            >
                                <h3 className="text-lg sm:text-xl font-bold text-gray-100 group-hover:text-white transition-colors flex items-center gap-2">
                                    {doc.title}
                                </h3>
                                {doc.category && (
                                    <span className={`inline-block mt-2 self-start px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${theme.badge_bg} ${theme.badge_text} ${theme.badge_border} border`}>
                                        {doc.category}
                                    </span>
                                )}
                                <p className="mt-3 text-sm text-gray-400 line-clamp-3">
                                    {doc.description}
                                </p>
                                {doc.tags && doc.tags.length > 0 && (
                                    <div className="mt-4 flex gap-2 flex-wrap">
                                        {doc.tags.slice(0, 3).map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {doc.tags.length > 3 && (
                                            <span className="text-xs font-medium px-2 py-1 text-gray-500">
                                                +{doc.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
                    <p className="text-gray-400">No articles found for the <span className="text-blue-400">{selectedStack}</span> stack.</p>
                    <p className="text-sm text-gray-500 mt-2">Try switching to "All" to see everything.</p>
                </div>
            )}
        </div>
    );
}
