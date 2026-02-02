'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    // Load from localStorage on mount (Client Side only) to match Server 'en' initially
    useEffect(() => {
        const saved = localStorage.getItem('velox_lang') as Language;
        if (saved && (saved === 'en' || saved === 'fr')) {
            setLanguage(saved);
        }
    }, []);

    // Update HTML lang attribute
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('velox_lang', lang);
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let value: any = translations[language];
        for (const key of keys) {
            value = value?.[key];
        }
        return value || path;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
}
