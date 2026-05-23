import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <main className="container mx-auto px-4 py-8 h-full flex flex-col pt-24">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Professional AI Assistant</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Leverage LLMs enhanced with specific security contexts. Select your operational domain.
        </p>
      </div>
      
      <ChatInterface />
    </main>
  );
}
