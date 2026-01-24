export interface ChecklistItem {
    id: string;
    text: string;
    description?: string;
    critical?: boolean;
}

export interface ChecklistData {
    id: string;
    title: string;
    description: string;
    category: 'Backend' | 'Frontend' | 'DevOps' | 'General';
    items: ChecklistItem[];
}

export const checklists: ChecklistData[] = [
    {
        id: 'nodejs-production',
        title: 'Node.js Production Readiness',
        description: 'Essential security checks before deploying a Node.js application to production.',
        category: 'Backend',
        items: [
            { id: 'env-node-env', text: 'Set NODE_ENV to "production"', critical: true },
            { id: 'helmet', text: 'Use Helmet.js for secure HTTP headers', critical: true },
            { id: 'rate-limit', text: 'Implement Rate Limiting for public APIs', critical: true },
            { id: 'logs-sanitization', text: 'Ensure logs do not contain sensitive data (PII, Secrets)', critical: true },
            { id: 'npm-audit', text: 'Run npm audit to check for vulnerable dependencies', critical: true },
            { id: 'cors', text: 'Configure CORS with specific allowed origins (no wildcard *)', critical: true },
            { id: 'error-handling', text: 'Implement global error handling (no stack traces to client)', critical: true },
        ]
    },
    {
        id: 'api-security',
        title: 'REST API Security',
        description: 'Standard security controls for any RESTful API.',
        category: 'Backend',
        items: [
            { id: 'https-tls', text: 'Enforce HTTPS/TLS 1.2+ for all endpoints', critical: true },
            { id: 'input-validation', text: 'Validate all input payloads against a schema (e.g. Zod/Joi)', critical: true },
            { id: 'auth-middleware', text: 'Authenticate all private routes', critical: true },
            { id: 'rate-limit-api', text: 'Apply rate limiting per user/IP', description: 'Prevent brute force and DoS' },
            { id: 'id-enumeration', text: 'Use UUIDs instead of sequential IDs', description: 'Prevents resource enumeration' },
            { id: 'method-limit', text: 'Disable unused HTTP methods (TRACE, TRACK)', critical: false },
        ]
    },
    {
        id: 'react-security',
        title: 'React Frontend Security',
        description: 'Client-side security best practices.',
        category: 'Frontend',
        items: [
            { id: 'deps', text: 'Audit dependencies for vulnerabilities' },
            { id: 'xss-danger', text: 'Avoid dangerouslySetInnerHTML', critical: true },
            { id: 'xss-sanitize', text: 'Sanitize user content before rendering', critical: true },
            { id: 'auth-storage', text: 'Store tokens securely (HttpOnly cookies preferred over LocalStorage)', critical: true },
            { id: 'opener', text: 'Use rel="noopener noreferrer" for external links', critical: false },
        ]
    }
];
