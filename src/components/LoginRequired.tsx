import React from 'react';

export default function LoginRequired({ title }: { title: string }) {
    const handleLogin = () => {
        if ((window as any).keycloak) {
            (window as any).keycloak.login();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm">
                This page contains protected DAST scan parameters and requires authentication to prevent abuse.
            </p>
            <button
                onClick={handleLogin}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-blue-500/20"
            >
                Log In with Keycloak SSO
            </button>
        </div>
    );
}
