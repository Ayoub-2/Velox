'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';

interface KBLinkProps {
    query: string;
}

export const KBLink: React.FC<KBLinkProps> = ({ query }) => {
    const [match, setMatch] = useState<{ title: string; url: string } | null>(null);

    useEffect(() => {
        if (!query) return;

        // Debounce or just fetch
        const fetchMatch = async () => {
            try {
                const data = await apiClient.matchKbArticle(query);
                if (data.match) {
                    setMatch(data.match);
                }
            } catch (e) {
                // Silent fail
            }
        };

        fetchMatch();
    }, [query]);

    if (!match) return null;

    return (
        <div className="mt-2">
            <Link
                to={match.url}
                target="_blank"
                className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.516v9.428a2.25 2.25 0 0 1-2.25 2.25v.904c0 .718.404 1.372 1.043 1.635.802.33 1.733.512 2.707.512 1.267 0 2.45-.254 3.456-.707.828.453 1.789.707 2.801.707 1.267 0 2.45-.254 3.456-.707.828.453 1.789.707 2.801.707 1.267 0 2.45-.254 3.456-.707 1.053-.424 1.794-1.259 1.794-2.222v-.904a2.25 2.25 0 0 1-2.25-2.25V4.571a.75.75 0 0 0-.5-.516A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v10.518a2.25 2.25 0 0 1-2.25 2.25 2.25 2.25 0 0 1-2.25-2.25V4.533Z" />
                </svg>
                Learn how to fix this: {match.title}
            </Link>
        </div>
    );
};
