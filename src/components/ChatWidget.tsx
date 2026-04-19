"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, X, MessageSquareCode, Trash2 } from "lucide-react";

type Message = { role: "user" | "assistant" | "system"; content: string; };

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("velox_dev_widget_history");
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("velox_dev_widget_history", JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  const clearHistory = () => {
    if (window.confirm("Clear Dev widget history?")) {
      setMessages([]);
      localStorage.removeItem("velox_dev_widget_history");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Locked specifically to "Dev" as requested 
        body: JSON.stringify({ messages: [...messages, userMessage], persona: "Dev" }), 
      });

      if (!response.ok) throw new Error("Failed to send message");

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.message) setMessages((prev) => [...prev, data.message]);
        return;
      }

      // Stream handling parsing logic
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '' && line.trim().startsWith('data: '));
        for (const line of lines) {
          const dataStr = line.replace(/^data: /, '').trim();
          if (dataStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(dataStr);
            assistantMessage += parsed.choices[0]?.delta?.content || "";
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: "assistant", content: assistantMessage };
              return newMessages;
            });
          } catch(e) {}
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all outline-none ring-4 ring-slate-100 dark:ring-slate-800"
        >
          <MessageSquareCode className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 opacity-90" />
              <div>
                <span className="font-bold text-sm tracking-wide">Dev Assistant</span>
                <p className="text-[10px] opacity-75 leading-none mt-0.5">Global context unlocked</p>
              </div>
            </div>
            <div className="flex items-center">
                <button onClick={clearHistory} className="p-1.5 mr-1 hover:bg-white/20 rounded-lg transition-colors" title="Clear History">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center opacity-70 mt-10 space-y-2">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquareCode className="w-6 h-6" />
                </div>
                <p className="text-slate-800 dark:text-slate-300 font-medium">Ready to assist.</p>
                <p className="text-slate-500 text-xs px-4">Ask me architecture or coding questions directly from any page in the portal.</p>
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center outline-none ${m.role === "user" ? "bg-slate-700 dark:bg-slate-600 text-white rounded-full shadow" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md ring-1 ring-purple-500/20"}`}>
                  {m.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-2 text-[13px] rounded-xl max-w-[85%] ${m.role === "user" ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-sm" : "bg-indigo-50/50 dark:bg-indigo-900/20 text-slate-900 dark:text-slate-100 rounded-tl-sm border border-indigo-100 dark:border-indigo-800/50"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                 <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center outline-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md ring-1 ring-purple-500/20">
                    <Bot className="w-4 h-4 animate-pulse" />
                 </div>
                 <div className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-slate-900 dark:text-slate-100 rounded-xl rounded-tl-sm flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask the Dev assistant..."
                className="w-full pl-4 pr-10 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
