'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StackSelector from '@/components/StackSelector';
import NavDropdown from '@/components/NavDropdown';

export default function Navbar() {
    const pathname = usePathname();
    const showStackSelector = pathname?.startsWith('/knowledge-base');

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            aria-label="Velox home"
                        >
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">V</div>
                            <span className="text-lg font-bold text-white tracking-tight">Velox</span>
                        </Link>
                        <div className="hidden md:flex gap-6 items-center">
                            <Link
                                href="/knowledge-base"
                                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 ${pathname?.startsWith('/knowledge-base') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
                                aria-label="Knowledge Base"
                            >
                                Knowledge Base
                            </Link>

                            <NavDropdown
                                label="Resources"
                                items={[
                                    { label: 'Checklists', href: '/checklists' },
                                    { label: 'Glossary', href: '/glossary' },
                                    { label: 'Comparisons', href: '/comparisons' },
                                    { label: 'Code Examples', href: '/code-examples' },
                                ]}
                            />

                            <Link
                                href="/dast"
                                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 ${pathname?.startsWith('/dast') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
                            >
                                DAST Engine
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {showStackSelector && <StackSelector />}
                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="text-xs font-semibold text-green-400">Phase 2: Orchestration</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
