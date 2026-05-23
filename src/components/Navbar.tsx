'use client';

import { Link, useLocation } from 'react-router-dom';
import StackSelector from '@/components/StackSelector';
import NavDropdown from '@/components/NavDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
    const location = useLocation();
    const pathname = location.pathname;
    const showStackSelector = pathname?.startsWith('/knowledge-base');
    const { t } = useLanguage();

    const isAuthenticated = localStorage.getItem('velox_authenticated') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userName = localStorage.getItem('velox_user_name') || '';

    const handleLogin = () => {
        if ((window as any).keycloak) {
            (window as any).keycloak.login();
        }
    };

    const handleLogout = () => {
        if ((window as any).keycloak) {
            localStorage.removeItem('velox_access_token');
            localStorage.removeItem('velox_authenticated');
            localStorage.removeItem('velox_user_username');
            localStorage.removeItem('velox_user_name');
            localStorage.removeItem('velox_user_empid');
            localStorage.setItem('isAdmin', 'false');
            (window as any).keycloak.logout({ redirectUri: window.location.origin });
        }
    };

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
                            to="/"
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            aria-label="Velox home"
                        >
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">V</div>
                            <span className="text-lg font-bold text-white tracking-tight">{t('navbar.brand')}</span>
                        </Link>
                        <div className="hidden md:flex gap-6 items-center">
                            <Link
                                to="/knowledge-base"
                                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 ${pathname?.startsWith('/knowledge-base') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
                                aria-label={t('navbar.kb')}
                            >
                                {t('navbar.kb')}
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
                                to="/dast"
                                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 ${pathname?.startsWith('/dast') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
                            >
                                {t('navbar.scans')}
                            </Link>
                            
                            <Link
                                to="/chat"
                                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1 ${pathname?.startsWith('/chat') ? 'text-teal-400' : 'text-slate-300 hover:text-teal-400'}`}
                            >
                                AI Assistant
                            </Link>

                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 ${pathname?.startsWith('/admin') ? 'text-purple-400 font-semibold' : 'text-slate-300 hover:text-purple-400'}`}
                                >
                                    Admin Portal
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {showStackSelector && <StackSelector />}
                        <LanguageSwitcher />
                        <ThemeToggle />
                        
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <span className="hidden sm:inline text-xs font-semibold text-slate-350">
                                    Hi, {userName.split(' ')[0]}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 text-xs font-bold text-white transition-all hover:bg-slate-700"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-all"
                            >
                                Log In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
