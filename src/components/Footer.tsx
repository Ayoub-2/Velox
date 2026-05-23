'use client';

import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer 
            className="border-t border-white/5 bg-slate-900/50 backdrop-blur-xl mt-auto"
            role="contentinfo"
        >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">© 2026 Velox Security. All rights reserved.</span>
                    </div>
                    <nav 
                        className="flex gap-6"
                        aria-label="Footer links"
                    >
                        <Link 
                            to="/" 
                            className="text-sm text-slate-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/knowledge-base" 
                            className="text-sm text-slate-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        >
                            Knowledge Base
                        </Link>
                        <a 
                            href="#" 
                            className="text-sm text-slate-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            aria-label="Documentation (coming soon)"
                        >
                            Documentation
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
