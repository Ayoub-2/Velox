import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { StackProvider } from './lib/stack-context';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Import Pages
import DashboardPage from './app/page';
import DastPage from './app/dast/page';
import DastDetailPage from './app/dast/[id]/page';
import ChatPage from './app/chat/page';
import ChecklistsPage from './app/checklists/page';
import CodeExamplesPage from './app/code-examples/page';
import ComparisonsPage from './app/comparisons/page';
import GlossaryPage from './app/glossary/page';
import KbPage from './app/knowledge-base/page';
import KbDetailPage from './app/knowledge-base/[slug]/page';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <StackProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
            <Navbar />
            <div className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dast" element={<DastPage />} />
                <Route path="/dast/:id" element={<DastDetailPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/checklists" element={<ChecklistsPage />} />
                <Route path="/code-examples" element={<CodeExamplesPage />} />
                <Route path="/comparisons" element={<ComparisonsPage />} />
                <Route path="/glossary" element={<GlossaryPage />} />
                <Route path="/knowledge-base" element={<KbPage />} />
                <Route path="/knowledge-base/:slug" element={<KbDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <ChatWidget />
            <Footer />
          </div>
        </StackProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
