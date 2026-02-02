import { NextResponse } from 'next/server';
import { getSortedDocsData } from '@/lib/docs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ match: null });
    }

    const docs = getSortedDocsData();
    const normalizedQuery = query.toLowerCase();

    // Simple Finding Logic
    // 1. Exact Tag Match
    // 2. Title allows fuzzy match

    const match = docs.find((doc) => {
        // Check tags
        if (doc.tags && Array.isArray(doc.tags)) {
            if (doc.tags.some((tag: string) => normalizedQuery.includes(tag.toLowerCase()))) {
                return true;
            }
        }
        // Check Title (e.g. "XSS" in "Cross-Site Scripting (XSS)")
        if (doc.title.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(doc.title.toLowerCase())) {
            return true;
        }

        // Heuristic mappings
        if (normalizedQuery.includes('xss') && doc.id === 'cross-site-scripting-prevention') return true;
        if (normalizedQuery.includes('sql') && doc.id === 'sql-injection-prevention') return true;
        if (normalizedQuery.includes('injection') && doc.id === 'sql-injection-prevention') return true;
        if (normalizedQuery.includes('auth') && doc.id === 'secure-authentication') return true;
        if (normalizedQuery.includes('cookie') && doc.id === 'secure-authentication') return true;

        return false;
    });

    if (match) {
        return NextResponse.json({
            match: {
                id: match.id,
                title: match.title,
                url: `/knowledge-base/${match.id}`
            }
        });
    }

    return NextResponse.json({ match: null });
}
