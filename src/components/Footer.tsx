import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-slate-900/50 backdrop-blur-xl mt-auto">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">© 2026 Velox Security. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                            Home
                        </Link>
                        <Link href="/knowledge-base" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                            Knowledge Base
                        </Link>
                        <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                            Documentation
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
