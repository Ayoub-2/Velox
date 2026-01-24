export interface GlossaryTerm {
    term: string;
    definition: string;
    category: 'General' | 'Authentication' | 'Vulnerability' | 'Compliance';
    link?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
    {
        term: 'Authentication (AuthN)',
        definition: 'The process of verifying the identity of a user, device, or system (e.g., verifying a password).',
        category: 'Authentication',
        link: '/knowledge-base/secure-authentication'
    },
    {
        term: 'Authorization (AuthZ)',
        definition: 'The process of determining what an authenticated entity is allowed to do (e.g., admin vs. user roles).',
        category: 'Authentication',
        link: '/knowledge-base/access-control'
    },
    {
        term: 'XSS (Cross-Site Scripting)',
        definition: 'A vulnerability where attackers inject malicious scripts into webpages viewed by other users.',
        category: 'Vulnerability',
        link: '/knowledge-base/cross-site-scripting-prevention'
    },
    {
        term: 'CSRF (Cross-Site Request Forgery)',
        definition: 'An attack that forces an end user to execute unwanted actions on a web application in which they are currently authenticated.',
        category: 'Vulnerability',
        link: '/knowledge-base/csrf-protection'
    },
    {
        term: 'SQL Injection (SQLi)',
        definition: 'A code injection technique used to attack data-driven applications by inserting malicious SQL statements.',
        category: 'Vulnerability',
        link: '/knowledge-base/sql-injection-prevention'
    },
    {
        term: 'RBAC (Role-Based Access Control)',
        definition: 'A method of restricting network access based on the roles of individual users within an enterprise.',
        category: 'Authentication',
        link: '/knowledge-base/access-control'
    },
    {
        term: 'Zero Trust',
        definition: 'A security concept centered on the belief that organizations should not automatically trust anything inside or outside its perimeters.',
        category: 'General'
    },
    {
        term: 'DAST (Dynamic Application Security Testing)',
        definition: 'A security testing process that analyses a web application through the front-end to find vulnerabilities through simulated attacks.',
        category: 'Compliance'
    },
    {
        term: 'SAST (Static Application Security Testing)',
        definition: 'A white-box testing method where source code is analyzed from the inside to find security vulnerabilities.',
        category: 'Compliance'
    },
    {
        term: 'Secrets Management',
        definition: 'The practices and tools used to digitally manage authentication credentials (secrets) such as passwords, keys, and APIs.',
        category: 'General',
        link: '/knowledge-base/secrets-management'
    }
].sort((a, b) => a.term.localeCompare(b.term)) as GlossaryTerm[];
