import { checklists } from '@/data/checklists';
import Checklist from '@/components/Checklist';

export const metadata = {
    title: 'Security Checklists - Velox',
    description: 'Interactive security checklists for Node.js, React, and REST APIs.',
};

export default function ChecklistsPage() {
    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-extrabold text-white mb-4">
                    Security Checklists
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Track your security implementation progress with interactive, persistent checklists.
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                {checklists.map(checklist => (
                    <Checklist key={checklist.id} data={checklist} />
                ))}
            </div>
        </div>
    );
}
