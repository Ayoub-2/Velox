'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
// We'll import the JSON directly. In a real app, this might be fetched.
// Note: You need to run `node scripts/extract-snippets.js` to generate this file first.
// @ts-ignore
import snippetsDataRaw from '@/data/code-snippets.json';

interface Snippet {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    articleId: string;
    articleTitle: string;
    tags: string[];
}

const snippetsData = snippetsDataRaw as Snippet[];

export default function CodeExamplesPage() {
    const [query, setQuery] = useState('');
    const [selectedLang, setSelectedLang] = useState('All');

    const languages = ['All', ...Array.from(new Set(snippetsData.map((s: Snippet) => s.language)))];

    const filteredSnippets = useMemo(() => {
        return snippetsData.filter(s => {
            const matchesQuery = query === '' ||
                s.code.toLowerCase().includes(query.toLowerCase()) ||
                s.description.toLowerCase().includes(query.toLowerCase());
            const matchesLang = selectedLang === 'All' || s.language === selectedLang;
            return matchesQuery && matchesLang;
        });
    }, [query, selectedLang]);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        // Toast logic could go here
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-4">
                        Code Examples Database
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Searchable repository of secure code patterns.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search code..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <select
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedLang}
                        onChange={e => setSelectedLang(e.target.value)}
                    >
                        {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                {/* Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {filteredSnippets.map((snippet) => (
                        <div key={snippet.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-bold text-blue-300">{snippet.language}</div>
                                    <Link href={`/knowledge-base/${snippet.articleId}`} className="text-xs text-slate-400 hover:text-white">
                                        from {snippet.articleTitle}
                                    </Link>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(snippet.code)}
                                    className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="p-4 bg-slate-950/50 flex-1 overflow-x-auto">
                                <pre className="text-sm font-mono text-gray-300">
                                    <code>{snippet.code}</code>
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
