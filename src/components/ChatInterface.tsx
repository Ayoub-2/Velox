"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Shield, Code, Briefcase, Trash2 } from "lucide-react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type Persona = "GRC" | "Pentest" | "Dev";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<Persona>("Pentest");
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("velox_main_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
    setIsInitialized(true);
  }, []);

  // Sync history to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("velox_main_chat_history", JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setMessages([]);
      localStorage.removeItem("velox_main_chat_history");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
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
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, an error occurred while connecting to the AI provider." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonaIcon = (p: Persona) => {
    switch (p) {
      case "GRC": return <Briefcase className="w-5 h-5" />;
      case "Pentest": return <Shield className="w-5 h-5" />;
      case "Dev": return <Code className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Velox AI Assistant
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Contextual, security-first intelligence.</p>
        </div>

        {/* Persona Selector */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          {(["GRC", "Pentest", "Dev"] as Persona[]).map((p) => (
            <button
              key={p}
              onClick={() => setPersona(p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${persona === p
                  ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              {getPersonaIcon(p)}
              {p}
            </button>
          ))}
          <button
            onClick={clearHistory}
            className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors ml-2"
            title="Clear History"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              {getPersonaIcon(persona)}
            </div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start a Conversation
            </h3>
            <p className="text-slate-500 text-sm max-w-sm">
              I am currently acting as a {persona} expert. Ask me questions tailored to this domain.
            </p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center mt-1 outline-none ${
                    m.role === "user"
                    ? "bg-slate-700 dark:bg-slate-600 text-white rounded-full shadow" 
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg ring-2 ring-purple-500/20"
                  }`}
              >
                {m.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={`px-5 py-4 max-w-[85%] ${
                    m.role === "user"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tr-sm shadow-sm"
                    : "bg-indigo-50/50 dark:bg-indigo-900/20 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-sm shadow-sm border border-indigo-100 dark:border-indigo-800/50"
                  }`}
              >
                {/* Lightweight Markdown rendering for Bold, Italic, and Inline Code */}
                {m.content.split('\n').map((line, i) => {
                  const parts = line.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
                  return (
                    <React.Fragment key={i}>
                      {parts.map((part, idx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
                        } else if (part.startsWith('`') && part.endsWith('`')) {
                          return <code key={idx} className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
                        } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                          return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
                        }
                        return <span key={idx}>{part}</span>;
                      })}
                      <br />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mt-1 text-slate-700 dark:text-teal-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-sm flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-300" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask a ${persona} question...`}
            className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all disabled:opacity-50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
