import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PERSONA_PROMPTS = {
  GRC: "You are an expert Governance, Risk, and Compliance (GRC) professional in multinational bank. Your goal is to guide the user on regulatory frameworks (e.g., ISO 27001, SOC 2, NIST), risk assessment strategies, and corporate compliance programs. Always provide structured, official, and policy-oriented advice. FORMAT Rule : Always respond in simple text response, no markdown formatting. EFFICIENCY Rule: always keep response short and concise. CRITICAL DLP RULE: If the user provides any raw sensitive data, passwords, or PII, refuse to process it and remind them of data security policies.",
  Pentest: "You are an elite Penetration Tester and Offensive Security Expert in multinational bank. Your goal is to help the user understand attack vectors, vulnerability exploitation, and remediation. Focus on technical details, proof-of-concept explanations, and security posture improvement. Never provide malicious payloads intended for illegal use. FORMAT Rule : Always respond in simple text response, no markdown formatting. EFFICIENCY Rule: always keep response short and concise. CRITICAL DLP RULE: Do not solicit or process real internal corporate credentials, sensitive source code, or PII.",
  Dev: "You are a Senior DevSecOps Software Engineer in multinational bank. Your goal is to help the user implement secure coding practices, architect resilient systems, and debug code from a security-first perspective. Write clean, readable code snippets and explain technical decisions clearly. FORMAT Rule : Always respond in simple text response, no markdown formatting. EFFICIENCY Rule: always keep response short and concise. CRITICAL DLP RULE: If the user provides proprietary source code containing hardcoded secrets or PII, immediately warn them to redact the information before continuing."
};

type Persona = keyof typeof PERSONA_PROMPTS;

// Data Loss Prevention (DLP) Regex Patterns
const DLP_PATTERNS = [
  /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i, // Email Addresses
  /(?:\d[ -]*?){13,16}/, // Credit Card Numbers (Basic)
  /(?:api_key|access_token|secret(?:_key)?|password)[\s]*[:=][\s]*["']?[a-zA-Z0-9\-_]{16,}["']?/i // Basic Secret Keys / Passwords
];

function containsSensitiveData(text: string): boolean {
  return DLP_PATTERNS.some(pattern => pattern.test(text));
}

export async function POST(req: Request) {
  try {
    const { messages, persona } = await req.json();
    console.log(`[AI-DEBUG] Incoming POST request | Persona: ${persona} | Messages Array Length: ${messages?.length || 0}`);

    if (!messages || !Array.isArray(messages)) {
      console.warn(`[AI-DEBUG] ❌ Rejected: Messages array is missing or invalid.`);
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Helper for backend audit logging
    const logAudit = async (status: string, content: string) => {
        try {
            const logEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                persona: persona,
                status: status,
                prompt: content
            }) + '\n';
            const logPath = path.join(process.cwd(), 'project-docs', 'security', 'ai_audit.jsonl');
            await fs.mkdir(path.dirname(logPath), { recursive: true });
            await fs.appendFile(logPath, logEntry);
        } catch (e) {
            console.error('[AI-DEBUG] Failed to write audit log', e);
        }
    };

    // Pre-flight DLP check on the user's latest incoming message
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage && latestMessage.role === 'user' && containsSensitiveData(latestMessage.content)) {
      console.warn(`[AI-DEBUG] 🛡️ DLP Triggered! Blocked outgoing payload containing sensitive regex match.`);
      await logAudit("DLP_BLOCKED", latestMessage.content);
      return NextResponse.json(
        { message: { role: 'assistant', content: '🛡️ **DLP Alert**: Message securely blocked before transmission. Please remove any sensitive PII, credit cards, or internal secret keys before sending.' } },
        { status: 200 } // Return 200 so the UI handles it gracefully as an assistant response
      );
    }

    if (!persona || !(persona in PERSONA_PROMPTS)) {
      console.warn(`[AI-DEBUG] ❌ Rejected: Invalid or missing persona '${persona}'.`);
      return NextResponse.json({ error: 'Valid persona is required (GRC, Pentest, Dev)' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not set in environment variables"); // DO NOT LOG THE KEY ITSELF
      return NextResponse.json({ error: 'AI capabilities are not configured correctly' }, { status: 500 });
    }

    // System prompt based on persona selection
    const systemMessage = {
      role: 'system',
      content: PERSONA_PROMPTS[persona as Persona]
    };

    // Format for OpenRouter API
    const payload = {
      model: "openrouter/auto", // Uses OpenRouter's auto-routing logic based on free keys / dashboard preference.
      messages: [systemMessage, ...messages.slice(-30)], // Keep last 30 messages for rich conversation memory!
      stream: true, // Re-enable streaming to fix speed delay
    };

    if (latestMessage && latestMessage.role === 'user') {
      await logAudit("PROCESSED", latestMessage.content);
    }

    console.log(`[AI-DEBUG] 🚀 Forwarding payload to OpenRouter | Model: ${payload.model} | Context Size: ${payload.messages.length} messages | Streaming: ${payload.stream}`);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080", // Required by OpenRouter for routing
        "X-Title": "Velox Chat", // Required by OpenRouter for dashboard visibility
      },
      body: JSON.stringify(payload),
    });

    console.log(`[AI-DEBUG] 📥 OpenRouter replied with HTTP ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI-DEBUG] ❌ OpenRouter API Hard Error:", errorText);
      return NextResponse.json({ error: 'Failed to communicate with the AI provider' }, { status: 502 });
    }

    console.log(`[AI-DEBUG] ✅ Stream established successfully. Proxying chunks back to client UI...`);
    // Proxy the stream back to the client directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: any) {
    console.error("Chat API error:", error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
