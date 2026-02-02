'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 transition-colors text-xs font-bold font-mono text-slate-400 hover:text-white"
            aria-label="Toggle Language"
        >
            <span className={language === 'en' ? 'text-blue-400' : 'opacity-50'}>EN</span>
            <span className="opacity-30">|</span>
            <span className={language === 'fr' ? 'text-blue-400' : 'opacity-50'}>FR</span>
        </button>
    );
}
