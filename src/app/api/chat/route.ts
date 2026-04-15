import { NextResponse } from 'next/server';

export const runtime = 'edge';

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

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Pre-flight DLP check on the user's latest incoming message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === 'user' && containsSensitiveData(latestMessage.content)) {
      return NextResponse.json(
        { message: { role: 'assistant', content: '🛡️ **DLP Alert**: Message securely blocked before transmission. Please remove any sensitive PII, credit cards, or internal secret keys before sending.' } },
        { status: 200 } // Return 200 so the UI handles it gracefully as an assistant response
      );
    }

    if (!persona || !(persona in PERSONA_PROMPTS)) {
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
      messages: [systemMessage, ...messages.slice(-10)], // Keep last 10 messages for context window management
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter for routing
        "X-Title": "Velox Chat", // Required by OpenRouter for dashboard visibility
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return NextResponse.json({ error: 'Failed to communicate with the AI provider' }, { status: 502 });
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ message: data.choices[0].message });
    } else {
      return NextResponse.json({ error: 'Invalid response from AI provider' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Chat API error:", error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
