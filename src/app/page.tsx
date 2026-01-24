import Link from 'next/link';

export const metadata = {
  title: 'Home - Velox Security Knowledge Base',
  description: 'Security by design knowledge base and DAST orchestration platform. Shift left on security.',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 opacity-20 blur-3xl bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full mix-blend-screen pointer-events-none"></div>

      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center">
        <div className="mb-8 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur opacity-30 animate-pulse"></div>
          <h1 className="relative text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
            Velox
          </h1>
        </div>
        <p className="max-w-2xl text-lg sm:text-xl lg:text-2xl text-slate-300 mb-12 leading-relaxed">
          The next-generation <span className="text-blue-300 font-semibold">Security by Design</span> Knowledge Base for modern engineering teams.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl px-2 sm:px-4">
          {/* Knowledge Base Card */}
          <Link
            href="/knowledge-base"
            className="group relative rounded-2xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8 hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="mb-4 text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
              Knowledge Base <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Explore our comprehensive library of security patterns, architecture guides, and compliance requirements.
            </p>
          </Link>

          {/* DAST Orchestrator (Phase 2) */}
          <div
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 opacity-60 cursor-not-allowed"
            aria-disabled="true"
          >
            <h2 className="mb-4 text-xl sm:text-2xl font-bold text-slate-500">
              DAST Engine <span className="text-xs ml-2 px-2 py-1 rounded-full bg-slate-800 text-yellow-500/80 border border-slate-700">Phase 2</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Automated security scanning and vulnerability reporting orchestration.
            </p>
          </div>

          {/* Analytics (Phase 3) */}
          <div
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 opacity-60 cursor-not-allowed"
            aria-disabled="true"
          >
            <h2 className="mb-4 text-xl sm:text-2xl font-bold text-slate-500">
              Analytics <span className="text-xs ml-2 px-2 py-1 rounded-full bg-slate-800 text-yellow-500/80 border border-slate-700">Phase 3</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Security insights, vulnerability trends, and remediation tracking.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

