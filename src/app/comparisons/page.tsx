import ComparisonMatrix, { ComparisonData } from '@/components/ComparisonMatrix';

export const metadata = {
    title: 'Pattern Comparisons - Velox',
    description: 'Interactive comparison matrices for security patterns.',
};

const matrices: ComparisonData[] = [
    {
        id: 'auth-methods',
        title: 'Authentication Methods: JWT vs Session vs OAuth',
        description: 'Choosing the right authentication strategy for your application architecture.',
        options: ['Session-Based', 'JWT (Stateless)', 'OAuth 2.0 / OIDC'],
        rows: [
            { feature: 'State Storage', options: { 'Session-Based': 'Server-side (Redis/DB)', 'JWT (Stateless)': 'Client-side', 'OAuth 2.0 / OIDC': 'External Provider' } },
            { feature: 'Scalability', options: { 'Session-Based': 'Medium (Requires Store)', 'JWT (Stateless)': 'High (No Store)', 'OAuth 2.0 / OIDC': 'High' } },
            { feature: 'Revocation', options: { 'Session-Based': 'Instant', 'JWT (Stateless)': 'Difficult (Requires Blacklist)', 'OAuth 2.0 / OIDC': 'Via Provider' } },
            { feature: 'Recommended Use', options: { 'Session-Based': 'Monolithic MPAs', 'JWT (Stateless)': 'Microservices / SPAs', 'OAuth 2.0 / OIDC': 'SSO / Third-Party Apps' } },
            { feature: 'Complexity', options: { 'Session-Based': 'Low', 'JWT (Stateless)': 'Medium', 'OAuth 2.0 / OIDC': 'High' } },
        ]
    },
    {
        id: 'hashing-algos',
        title: 'Hashing Algorithms',
        description: 'Comparison of cryptographic hash functions for password storage.',
        options: ['Argon2id', 'bcrypt', 'SHA-256', 'MD5'],
        rows: [
            { feature: 'Memory Hard', options: { 'Argon2id': true, 'bcrypt': false, 'SHA-256': false, 'MD5': false } },
            { feature: 'GPU Resistance', options: { 'Argon2id': 'High', 'bcrypt': 'Medium', 'SHA-256': 'None', 'MD5': 'None' } },
            { feature: 'Speed', options: { 'Argon2id': 'Adjustable (Slow)', 'bcrypt': 'Slow', 'SHA-256': 'Very Fast', 'MD5': 'Very Fast' } },
            { feature: 'Recommended', options: { 'Argon2id': true, 'bcrypt': true, 'SHA-256': false, 'MD5': false } },
            { feature: 'NIST Approved', options: { 'Argon2id': true, 'bcrypt': 'Legacy', 'SHA-256': false, 'MD5': false } },
        ]
    }
];

export default function ComparisonsPage() {
    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-4">
                        Pattern Comparisons
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Make informed architectural decisions with side-by-side security pattern comparisons.
                    </p>
                </div>

                <div className="space-y-16">
                    {matrices.map(matrix => (
                        <ComparisonMatrix key={matrix.id} data={matrix} />
                    ))}
                </div>
            </div>
        </div>
    );
}
