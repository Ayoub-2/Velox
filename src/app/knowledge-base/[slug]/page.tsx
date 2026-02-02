import { getAllDocIds, getDocData } from '@/lib/docs';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    const paths = getAllDocIds();
    return paths;
}

const getCategoryTheme = (category: string) => {
    const themes: Record<string, { bg: string, text: string, border: string, gradient: string, badge_bg: string, badge_text: string, badge_border: string }> = {
        'Authorization': {
            bg: 'from-slate-950 to-indigo-950',
            text: 'text-indigo-400',
            border: 'border-indigo-800',
            gradient: 'from-indigo-200 to-indigo-400',
            badge_bg: 'bg-indigo-900/30',
            badge_text: 'text-indigo-300',
            badge_border: 'border-indigo-800'
        },
        'Application Logic': {
            bg: 'from-slate-950 to-emerald-950',
            text: 'text-emerald-400',
            border: 'border-emerald-800',
            gradient: 'from-emerald-200 to-emerald-400',
            badge_bg: 'bg-emerald-900/30',
            badge_text: 'text-emerald-300',
            badge_border: 'border-emerald-800'
        },
        'Operations': {
            bg: 'from-slate-950 to-purple-950',
            text: 'text-purple-400',
            border: 'border-purple-800',
            gradient: 'from-purple-200 to-purple-400',
            badge_bg: 'bg-purple-900/30',
            badge_text: 'text-purple-300',
            badge_border: 'border-purple-800'
        },
        'Configuration': {
            bg: 'from-slate-950 to-amber-950',
            text: 'text-amber-400',
            border: 'border-amber-800',
            gradient: 'from-amber-200 to-amber-400',
            badge_bg: 'bg-amber-900/30',
            badge_text: 'text-amber-300',
            badge_border: 'border-amber-800'
        },
        'Authentication': {
            bg: 'from-slate-950 to-blue-950',
            text: 'text-blue-400',
            border: 'border-blue-800',
            gradient: 'from-blue-200 to-blue-400',
            badge_bg: 'bg-blue-900/30',
            badge_text: 'text-blue-300',
            badge_border: 'border-blue-800'
        }
    };
    return themes[category] || themes['Authorization']; // Default
};

export default async function Doc({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const postData = await getDocData(resolvedParams.slug);
    const theme = getCategoryTheme(postData.category || 'Authorization');

    return (
        <div className={`min-h-screen bg-gradient-to-b ${theme.bg} text-white py-12 px-4 sm:px-6 lg:px-8`}>
            <div className="max-w-7xl mx-auto">
                <Link href="/knowledge-base" className={`inline-flex items-center text-sm ${theme.text} hover:opacity-80 transition-opacity mb-8 group`}>
                    <span className="group-hover:-translate-x-1 transition-transform mr-2">&larr;</span>
                    Back to Knowledge Base
                </Link>

                <article className="prose prose-xl prose-invert mx-auto max-w-none">
                    {/* Header */}
                    <div className="not-prose mb-12 border-b border-gray-800 pb-8">
                        {postData.category && (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${theme.badge_bg} ${theme.badge_text} ${theme.badge_border} border mb-4`}>
                                {postData.category}
                            </span>
                        )}
                        <h1 className={`text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient} leading-tight`}>{postData.title || postData.id}</h1>
                        {postData.description && (
                            <p className="text-2xl text-gray-400 mt-6 leading-relaxed font-light">{postData.description}</p>
                        )}
                        {postData.tags && (
                            <div className="flex gap-2 mt-6">
                                {postData.tags.map((tag: string) => (
                                    <span key={tag} className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="[&>h1]:hidden" dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} />
                </article>
            </div>
        </div>
    );
}
