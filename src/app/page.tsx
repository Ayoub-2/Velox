'use client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-24 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 opacity-20 blur-3xl bg-gradient-to-b from-blue-400 to-cyan-300 dark:from-blue-600 dark:to-cyan-500 rounded-full mix-blend-screen pointer-events-none"></div>

      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center">
        <div className="mb-8 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur opacity-30 animate-pulse"></div>
          <h1 className="relative text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">
            {t('landing.hero_title')}
          </h1>
        </div>
        <p className="max-w-2xl text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
          {t('landing.hero_subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl px-2 sm:px-4">
          {/* Knowledge Base Card */}
          <Link
            to="/knowledge-base"
            className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-6 sm:p-8 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="mb-4 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              {t('landing.kb_title')} <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('landing.kb_desc')}
            </p>
          </Link>

          {/* DAST Orchestrator (Phase 2) */}
          <Link
            to="/dast"
            className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-6 sm:p-8 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="mb-4 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              {t('landing.dast_title')} <span className="text-xs ml-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400 border border-green-500/30">{t('common.live')}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('landing.dast_desc')}
            </p>
          </Link>

          {/* Analytics (Phase 3 - Now Live) */}
          <Link
            to="/dast" // Link to DAST dashboard for analytics
            className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-6 sm:p-8 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="mb-4 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              {t('landing.analytics_title')} <span className="text-xs ml-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400 border border-green-500/30">{t('common.live')}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {t('landing.analytics_desc')}
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

