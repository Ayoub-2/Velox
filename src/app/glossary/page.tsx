'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { glossaryTerms } from '@/data/glossary';

export default function GlossaryPage() {
    const [query, setQuery] = useState('');

    const filteredTerms = useMemo(() => {
        if (!query) return glossaryTerms;
        const lowerQuery = query.toLowerCase();
        return glossaryTerms.filter(t =>
            t.term.toLowerCase().includes(lowerQuery) ||
            t.definition.toLowerCase().includes(lowerQuery)
        );
    }, [query]);

    // Group by first letter
    const groupedTerms = useMemo(() => {
        const groups: Record<string, typeof glossaryTerms> = {};
        filteredTerms.forEach(term => {
            const letter = term.term.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(term);
        });
        return groups;
    }, [filteredTerms]);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-white mb-4 text-center">
                    Security Glossary
                </h1>
                <p className="text-xl text-slate-400 text-center mb-10">
                    Definitive reference for security terminology and concepts.
                </p>

                {/* Search */}
                <div className="relative mb-10 max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search glossary..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Terms List */}
                <div className="space-y-12">
                    {Object.keys(groupedTerms).sort().map(letter => (
                        <div key={letter} id={`section-${letter}`} className="relative">
                            <div className="sticky top-20 z-10 bg-slate-900/95 backdrop-blur py-2 mb-4 border-b border-slate-800">
                                <h2 className="text-2xl font-bold text-blue-400">{letter}</h2>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {groupedTerms[letter].map((term) => (
                                    <div
                                        key={term.term}
                                        className="bg-slate-800/30 rounded-lg p-5 border border-slate-800 hover:border-blue-500/30 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                                                {term.term}
                                            </h3>
                                            <span className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                                                {term.category}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-3">
                                            {term.definition}
                                        </p>
                                        {term.link && (
                                            <Link
                                                href={term.link}
                                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                                            >
                                                Learn more &rarr;
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredTerms.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            No terms found matching "{query}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
