import Link from 'next/link';
import Search from '@/components/Search';
import StackAwareArticleList from '@/components/StackAwareArticleList';
import { getSortedDocsData } from '@/lib/docs';
import { DocData } from '@/lib/types';

export const metadata = {
    title: 'Knowledge Base - Velox Security',
    description: 'Browse security patterns including authentication, API security, input validation, access control, and more.',
    keywords: ['security patterns', 'knowledge base', 'authentication', 'API security', 'OWASP'],
};

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

export default function KnowledgeBase() {
    const allDocs: DocData[] = getSortedDocsData();

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
