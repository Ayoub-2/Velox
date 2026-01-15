'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocData } from '@/lib/types';

interface SearchProps {
    docs: DocData[];
}

export default function Search({ docs }: SearchProps) {
    const [query, setQuery] = useState('');
    const router = useRouter();

    // Memoize filtered results to prevent unnecessary recalculations
    const filteredDocs = useMemo(() => {
        if (query === '') return [];
        
        const searchLower = query.toLowerCase();
        return docs.filter((doc) => (
            doc.title.toLowerCase().includes(searchLower) ||
            doc.description.toLowerCase().includes(searchLower) ||
            doc.category?.toLowerCase().includes(searchLower) ||
            doc.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        ));
    }, [query, docs]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setQuery('');
        }
    };

    return (
        <div className="relative w-full max-w-lg mx-auto mb-10 z-20">
            <div className="relative group">
                <input
                    type="text"
                    className="block w-full p-4 pl-12 text-base text-gray-100 placeholder-gray-400 border border-gray-700/50 rounded-xl bg-black/20 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 outline-none"
                    placeholder="Search security patterns (e.g., 'SQL', 'Auth')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search security patterns"
                    aria-describedby="search-help"
                    aria-expanded={query !== '' && filteredDocs.length > 0}
                    aria-controls="search-results"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg 
                        aria-hidden="true" 
                        className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <div id="search-help" className="sr-only">
                    Search by pattern name, description, category, or tags. Press Escape to clear.
                </div>
            </div>

            {query !== '' && (
                <div 
                    className="absolute z-30 w-full mt-2 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 max-h-96 overflow-y-auto ring-1 ring-black/5"
                    id="search-results"
                    role="region"
                    aria-label="Search results"
                >
                    {filteredDocs.length > 0 ? (
                        <div className="py-2">
                            {filteredDocs.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/knowledge-base/${doc.id}`}
                                    className="block px-4 py-3 hover:bg-white/5 transition-colors group border-b border-gray-800/50 last:border-0 focus:outline-none focus:bg-white/10"
                                >
                                    <div className="font-semibold text-gray-200 group-hover:text-blue-300 transition-colors">
                                        {doc.title}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate mt-0.5">
                                        {doc.description}
                                    </div>
                                    {doc.tags && (
                                        <div className="mt-2 flex gap-1.5 flex-wrap">
                                            {doc.tags.map(tag => (
                                                <span 
                                                    key={tag} 
                                                    className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-sm text-gray-400 text-center">
                            No results found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
