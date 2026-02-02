export type Language = 'en' | 'fr';

export const translations = {
    en: {
        navbar: {
            brand: 'Velox',
            kb: 'Knowledge Base',
            scans: 'DAST Engine',
            reports: 'Reports'
        },
        common: {
            live: 'Live',
            completed: 'Completed',
            phase_3: 'Phase 3'
        },
        landing: {
            hero_title: 'Velox',
            hero_subtitle: 'The next-generation Security by Design Knowledge Base for modern engineering teams.',
            kb_title: 'Knowledge Base',
            kb_desc: 'Explore our comprehensive library of security patterns, architecture guides, and compliance requirements.',
            dast_title: 'DAST Engine',
            dast_desc: 'Automated security scanning and vulnerability reporting orchestration.',
            analytics_title: 'Analytics',
            analytics_desc: 'Security insights, vulnerability trends, and remediation tracking.'
        }
    },
    fr: {
        navbar: {
            brand: 'Velox',
            kb: 'Base de Connaissances',
            scans: 'Moteur DAST',
            reports: 'Rapports'
        },
        common: {
            live: 'En ligne',
            completed: 'Terminé',
            phase_3: 'Phase 3'
        },
        landing: {
            hero_title: 'Velox',
            hero_subtitle: 'La base de connaissances Security by Design de nouvelle génération pour les équipes d\'ingénierie modernes.',
            kb_title: 'Base de Connaissances',
            kb_desc: 'Explorez notre bibliothèque complète de modèles de sécurité, guides d\'architecture et exigences de conformité.',
            dast_title: 'Moteur DAST',
            dast_desc: 'Orchestration automatisée de scans de sécurité et rapports de vulnérabilité.',
            analytics_title: 'Analytique',
            analytics_desc: 'Perspectives de sécurité, tendances des vulnérabilités et suivi des remédiations.'
        }
    }
};
