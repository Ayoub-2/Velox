'use client';

import { TechStack, useStack } from '@/lib/stack-context';

export default function StackSelector() {
    const { selectedStack, setStack } = useStack();
    const stacks: TechStack[] = ['All', 'Frontend', 'Backend', 'DevOps', 'Mobile'];

    return (
        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            {stacks.map((stack) => (
                <button
                    key={stack}
                    onClick={() => setStack(stack)}
                    className={`
                        px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                        ${selectedStack === stack
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}
                    `}
                    aria-label={`Select ${stack} stack`}
                    aria-pressed={selectedStack === stack}
                >
                    {stack}
                </button>
            ))}
        </div>
    );
}
