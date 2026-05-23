'use client';

import { useState, useEffect } from 'react';
import Search from '@/components/Search';
import StackAwareArticleList from '@/components/StackAwareArticleList';
import { apiClient } from '@/lib/api';
import { DocData } from '@/lib/types';

export default function KnowledgeBase() {
    const [allDocs, setAllDocs] = useState<DocData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await apiClient.getKbArticles();
                setAllDocs(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load knowledge base articles');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <h2 className="text-xl font-bold text-red-500 mb-4">{error}</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="text-center relative z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl -z-10 opacity-30 blur-3xl bg-gradient-to-r from-blue-300 to-cyan-300 dark:from-blue-500 dark:to-cyan-500 rounded-full mix-blend-screen pointer-events-none"></div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 mb-4 sm:mb-6">
                        Velox Knowledge Base
                    </h1>
                    <p className="mt-2 sm:mt-3 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-600 dark:text-gray-300 mb-8 sm:mb-10">
                        Essential security patterns, requirements, and strategies.
                    </p>
                    <Search docs={allDocs} />
                </div>
                <div className="mt-12 sm:mt-16 mx-auto">
                    <StackAwareArticleList initialDocs={allDocs} />
                </div>
            </div>
        </div>
    );
}

