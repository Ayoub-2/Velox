'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocData } from '@/lib/types';
import { useStack } from '@/lib/stack-context';

interface SearchProps {
    docs: DocData[];
}

export default function Search({ docs }: SearchProps) {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const { selectedStack } = useStack();
    const router = useRouter();

    // Extract unique categories from docs
    const categories = useMemo(() => {
        const unique = new Set(docs.map(d => d.category).filter(Boolean));
        return ['All', ...Array.from(unique)];
    }, [docs]);



    // Memoize filtered results
    const filteredDocs = useMemo(() => {
        if (query === '' && selectedCategory === 'All') return [];

        const searchLower = query.toLowerCase();

        return docs.filter((doc) => {
            // 1. Text Search
            const matchesSearch =
                doc.title.toLowerCase().includes(searchLower) ||
                doc.description.toLowerCase().includes(searchLower) ||
                doc.tags?.some(tag => tag.toLowerCase().includes(searchLower));

            // 2. Stack Filter (Global)
            const matchesStack = selectedStack === 'All' ||
                doc.tags?.some(tag => tag.toLowerCase() === selectedStack.toLowerCase()) ||
                doc.category?.toLowerCase() === selectedStack.toLowerCase();

            // 3. Category Filter
            const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;



            return matchesSearch && matchesStack && matchesCategory;
        });
    }, [query, docs, selectedCategory, selectedStack]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setQuery('');
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-10 z-20">
            {/* Search Input */}
            <div className="relative group mb-3">
                <input
                    type="text"
                    className="block w-full p-4 pl-12 text-base text-gray-100 placeholder-gray-400 border border-gray-700/50 rounded-xl bg-black/20 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 outline-none"
                    placeholder={`Search ${selectedStack === 'All' ? '' : selectedStack + ' '}security patterns...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search security patterns"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-2">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none hover:bg-slate-800 transition-colors"
                >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>


            </div>

            {/* Results Dropdown */}
            {(query !== '' || selectedCategory !== 'All') && (
                <div
                    className="absolute z-30 w-full mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 max-h-96 overflow-y-auto ring-1 ring-black/5"
                    role="region"
                    aria-label="Search results"
                >
                    {filteredDocs.length > 0 ? (
                        <div className="divide-y divide-gray-800/50">
                            {filteredDocs.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/knowledge-base/${doc.id}`}
                                    className="block px-4 py-3 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-semibold text-gray-200 group-hover:text-blue-300 transition-colors">
                                            {doc.title}
                                        </div>

                                    </div>
                                    <div className="text-sm text-gray-400 truncate mt-0.5">
                                        {doc.description}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        {doc.category && <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/50">{doc.category}</span>}
                                        <div className="flex gap-1 flex-wrap">
                                            {doc.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] text-blue-400">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-sm text-gray-400 text-center">
                            No results found. Try adjusting your filters or stack ({selectedStack}).
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
