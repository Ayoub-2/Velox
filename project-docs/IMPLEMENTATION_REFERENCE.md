# Velox Features - Quick Implementation Reference

**Last Updated**: January 20, 2026

---

## 🎯 At a Glance

| Feature | Priority | Difficulty | Timeline | Tech Required | Start Date |
|---------|----------|-----------|----------|---------------|-----------|
| **Tech Stack Selector** | P0 | 🟢 Easy | 1.5w | React hooks + localStorage | Week 1 |
| **Advanced Search** | P0 | 🟢 Easy | 1.5w | TailwindCSS + filtering | Week 1 |
| **Bookmarking** | P1 | 🟢 Easy | 1w | localStorage + custom hook | Week 2 |
| **Content Ratings** | P2 | 🟢 Easy | 2w | React + localStorage | Week 3 |
| **Glossary** | P2 | 🟢 Easy | 2.5w | Markdown parsing + components | Week 4 |
| **Checklists** | P1 | 🟡 Medium | 3.5w | Data structures + forms | Week 4 |
| **Code Examples DB** | P2 | 🟡 Medium | 3w | Build-time extraction + syntax highlighting | Week 5 |
| **Comparison Matrices** | P2 | 🟡 Medium | 4w | React components + data | Week 6 |
| **Article Versioning** | P2 | 🟡 Medium | 4w | Git integration or database | Week 7 |
| **DAST Prep** | P1 | 🟡 Medium | 4w | API design + architecture | Week 7 |
| **Accessibility** | P2 | 🟡 Medium | 3.5w | WCAG audit + theme support | Week 8 |
| **Offline Mode** | P3 | 🔴 Hard | 3.5w | Service Workers + next-pwa | Week 9 |
| **Learning Paths** | P1 | 🟡 Medium | 3.5w | Data structures + progress tracking | Week 5 |
| **Search Analytics** | P3 | 🔴 Hard | 3.5w | Event tracking + dashboard | Week 10 |
| **i18n (Multi-Language)** | P3 | 🟣 Hard | 5-6w | next-intl + translations | Week 11 |
| **Scorecard Dashboard** | P1 | 🔴 Hard | 5w | Backend + database + metrics | Phase 3 |

---

## 📋 Implementation Checklist by Phase

### Phase 2A: Quick Wins (Weeks 1-3)

- [ ] **Tech Stack Selector**
  - [ ] Add `techStack: []` to article frontmatter (all 14 articles)
  - [ ] Create `TechStackSelector.tsx` component
  - [ ] Extend `Search.tsx` filter logic
  - [ ] Store selection in localStorage
  - [ ] Test filtering across different stacks

- [ ] **Advanced Search & Filters**
  - [ ] Add difficulty levels to article metadata
  - [ ] Create `FilterPanel.tsx` component
  - [ ] Update Search.tsx with advanced filters
  - [ ] Implement sort options
  - [ ] Save filter preferences to localStorage
  - [ ] Performance test search (target: <200ms)

- [ ] **Bookmarking**
  - [ ] Create `useBookmarks()` hook
  - [ ] Add bookmark button to `[slug]/page.tsx`
  - [ ] Create `/bookmarks` page
  - [ ] Show bookmarks count on article cards
  - [ ] Test localStorage persistence

### Phase 2B: Core Enhancements (Weeks 4-8)

- [ ] **Checklists**
  - [ ] Define Checklist TypeScript interfaces
  - [ ] Create 15-20 checklist data files
  - [ ] Build `ChecklistComponent.tsx`
  - [ ] Implement `useChecklistState()` hook
  - [ ] Add PDF/Markdown export functionality
  - [ ] Create shareable URLs with checksums
  - [ ] Add `/checklists` page with listing

- [ ] **Code Examples Database**
  - [ ] Create `buildCodeIndex.ts` to extract snippets
  - [ ] Install syntax highlighting library (Prism.js)
  - [ ] Build `CodeSnippetViewer.tsx` component
  - [ ] Add "Copy to Clipboard" functionality
  - [ ] Create `/code-examples` search page
  - [ ] Test on different screen sizes

- [ ] **Comparison Matrices**
  - [ ] Design comparison data structure
  - [ ] Create `ComparisonTable.tsx` component
  - [ ] Create `DecisionTree.tsx` component (optional: react-flow)
  - [ ] Write 8-10 comparison matrices content
  - [ ] Create `/comparisons` page
  - [ ] Add links from relevant articles

- [ ] **Article Versioning (Git-based MVP)**
  - [ ] Create `getDocVersions.ts` using Git commands
  - [ ] Add version metadata to frontmatter
  - [ ] Build `ArticleHistory.tsx` component
  - [ ] Create `/article/[slug]/history` route
  - [ ] Add "Last Updated" display
  - [ ] Create changelog view

- [ ] **DAST Integration Prep**
  - [ ] Design API route structure
  - [ ] Create TypeScript interfaces for Scan/Finding
  - [ ] Build `ScanConfigForm.tsx` component
  - [ ] Create `/api/scans` route scaffolding (commented)
  - [ ] Design vulnerability→KB article mapping
  - [ ] Create architecture decision document

- [ ] **Accessibility & Theme**
  - [ ] Conduct WCAG 2.1 AA audit (axe, Lighthouse)
  - [ ] Create light theme color scheme
  - [ ] Update `tailwind.config.ts` for both themes
  - [ ] Build `ThemeToggle.tsx` component
  - [ ] Fix color contrast issues
  - [ ] Add high-contrast mode option
  - [ ] Test keyboard navigation
  - [ ] Update ARIA labels
  - [ ] Add skip-to-main-content link

- [ ] **Learning Paths**
  - [ ] Define LearningPath TypeScript interface
  - [ ] Create 8-12 predefined learning paths
  - [ ] Build `LearningPathViewer.tsx` component
  - [ ] Implement progress tracking hook
  - [ ] Create `/learning-paths` page
  - [ ] Add path recommendations based on role

- [ ] **Glossary**
  - [ ] Write 100+ glossary term definitions
  - [ ] Create `glossary/` markdown files
  - [ ] Build `GlossaryPage` component
  - [ ] Create `GlossaryTooltip` component
  - [ ] Implement auto-linking in articles
  - [ ] Test tooltip UX across devices
  - [ ] Add glossary to search

- [ ] **Content Ratings**
  - [ ] Create `RatingComponent.tsx` (5-star)
  - [ ] Build `useRatings()` hook
  - [ ] Add rating persistence to localStorage
  - [ ] Create `/ratings` admin page (trending)
  - [ ] Add "Was this helpful?" poll
  - [ ] Display average ratings on cards
  - [ ] Test data aggregation

### Phase 2C: Advanced Features (Weeks 9-12)

- [ ] **Offline Mode (PWA)**
  - [ ] Install `next-pwa` package
  - [ ] Configure in `next.config.ts`
  - [ ] Create `public/manifest.json`
  - [ ] Implement Service Worker with caching strategies
  - [ ] Add offline detection
  - [ ] Create client-side search indexing (lunr.js)
  - [ ] Add "Offline Mode" indicator in UI
  - [ ] Test on multiple browsers
  - [ ] Create offline documentation

- [ ] **Search Analytics Dashboard**
  - [ ] Create `useAnalytics()` hook
  - [ ] Implement privacy-preserving event tracking
  - [ ] Build analytics storage (localStorage MVP)
  - [ ] Create `/analytics` dashboard page
  - [ ] Add search query trends visualization
  - [ ] Track article view frequency
  - [ ] Implement CSV/JSON export
  - [ ] Create privacy policy updates

### Phase 3: Long-term

- [ ] **Multi-Language Support (i18n)**
  - [ ] Install `next-intl` package
  - [ ] Configure i18n routing in next.config.ts
  - [ ] Extract all UI strings to translation files
  - [ ] Create translation file structure
  - [ ] Translate UI (500+ strings) to 2-3 languages
  - [ ] Professional translation of core KB articles
  - [ ] Build language switcher component
  - [ ] Test RTL support
  - [ ] SEO setup for multiple languages

- [ ] **Scorecard Dashboard**
  - [ ] Design scorecard algorithm and metrics
  - [ ] Create dashboard UI mockups
  - [ ] Build metric visualization components
  - [ ] Design database schema for metrics
  - [ ] Implement metrics collection API
  - [ ] Build aggregation pipeline
  - [ ] Create scorecard calculation engine
  - [ ] Build historical trending
  - [ ] Security Team alignment on scoring

---

## 🛠️ Code Templates & Patterns

### Pattern 1: localStorage Persistence Hook
```typescript
// src/lib/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}
```

### Pattern 2: Advanced Filter Logic
```typescript
// src/lib/filterUtils.ts
interface FilterCriteria {
  searchQuery: string;
  category?: string;
  difficulty?: string;
  techStack?: string[];
}

export function filterDocs(docs: DocData[], criteria: FilterCriteria): DocData[] {
  return docs.filter(doc => {
    // Search query
    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase();
      const matches = 
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(query));
      if (!matches) return false;
    }

    // Category
    if (criteria.category && doc.category !== criteria.category) {
      return false;
    }

    // Difficulty
    if (criteria.difficulty && doc.difficulty !== criteria.difficulty) {
      return false;
    }

    // Tech Stack (ANY match)
    if (criteria.techStack?.length) {
      const hasMatch = doc.techStack?.some(stack => 
        criteria.techStack!.includes(stack)
      );
      if (!hasMatch) return false;
    }

    return true;
  });
}
```

### Pattern 3: Article Metadata Enhancement
```yaml
# Example: knowledge-base/secure-auth.md
---
title: 'Secure Authentication'
description: 'Implementing MFA and session management'
category: 'Authentication'
difficulty: 'Intermediate'
techStack: ['node', 'python', 'go']
tags: ['auth', 'mfa', 'oauth']
---
```

### Pattern 4: React Component with Accessibility
```typescript
// src/components/RatingComponent.tsx
'use client';

interface RatingComponentProps {
  articleId: string;
  onRate: (rating: number) => void;
  currentRating?: number;
}

export default function RatingComponent({
  articleId,
  onRate,
  currentRating
}: RatingComponentProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  return (
    <div
      className="flex gap-1"
      role="group"
      aria-labelledby={`rating-label-${articleId}`}
    >
      <label id={`rating-label-${articleId}`} className="sr-only">
        Rate this article
      </label>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          onMouseEnter={() => setHoveredRating(rating)}
          onMouseLeave={() => setHoveredRating(null)}
          className={`w-8 h-8 text-2xl transition-colors ${
            (hoveredRating || currentRating) && rating <= (hoveredRating || currentRating)
              ? 'text-yellow-400'
              : 'text-gray-400'
          }`}
          aria-label={`Rate ${rating} stars`}
          aria-pressed={currentRating === rating}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

---

## 📊 Data Structure Templates

### Checklist Structure
```typescript
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  resources: string[]; // related KB article IDs
  priority: 'high' | 'medium' | 'low';
}

interface Checklist {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  items: ChecklistItem[];
}
```

### Learning Path Structure
```typescript
interface LearningPathArticle {
  articleId: string;
  order: number;
  estimatedTime: number; // minutes
  keyTakeaways: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., "Microservices Security"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string; // e.g., "Backend Engineers"
  estimatedTotalTime: number; // minutes
  articles: LearningPathArticle[];
  prerequisitePaths?: string[]; // other path IDs
}
```

### Comparison Matrix Structure
```typescript
interface ComparisonOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  useCases: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  performanceRating: 1 | 2 | 3 | 4 | 5;
  securityRating: 1 | 2 | 3 | 4 | 5;
  maintenanceRating: 1 | 2 | 3 | 4 | 5;
  relatedArticles: string[];
}

interface ComparisonMatrix {
  id: string;
  title: string;
  question: string; // e.g., "Which authentication method should I use?"
  category: string;
  options: ComparisonOption[];
  recommendation?: string;
}
```

---

## 🔍 File Changes Summary

### New Files to Create
```
src/
├── lib/
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useBookmarks.ts
│   │   ├── useChecklists.ts
│   │   ├── useRatings.ts
│   │   └── useAnalytics.ts
│   ├── filterUtils.ts
│   ├── analyticsUtils.ts
│   └── codeExtractor.ts
├── components/
│   ├── TechStackSelector.tsx
│   ├── FilterPanel.tsx
│   ├── RatingComponent.tsx
│   ├── ChecklistComponent.tsx
│   ├── CodeSnippetViewer.tsx
│   ├── ComparisonTable.tsx
│   ├── DecisionTree.tsx
│   ├── ArticleHistory.tsx
│   ├── GlossaryTooltip.tsx
│   ├── ThemeToggle.tsx
│   ├── LearningPathViewer.tsx
│   └── AnalyticsDashboard.tsx
└── app/
    ├── bookmarks/
    │   └── page.tsx
    ├── checklists/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    ├── code-examples/
    │   └── page.tsx
    ├── comparisons/
    │   └── page.tsx
    ├── glossary/
    │   └── page.tsx
    ├── learning-paths/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    ├── ratings/
    │   └── page.tsx
    ├── analytics/
    │   └── page.tsx
    └── api/
        └── scans/
            └── (route stubs for Phase 2)

knowledge-base/
├── (14 existing articles updated with metadata)
glossary/
└── (100+ term definition files)

checklists/
└── (15-20 checklist data files)

comparisons/
└── (8-10 comparison matrix files)

learning-paths/
└── (8-12 learning path definition files)
```

### Files to Modify
```
src/
├── lib/
│   ├── types.ts                    # Add new field types
│   └── docs.ts                     # Update metadata reading
├── components/
│   ├── Search.tsx                  # Add filter UI + logic
│   ├── Navbar.tsx                  # Add theme toggle
│   └── Footer.tsx                  # (minor updates)
└── app/
    ├── layout.tsx                  # Add theme provider
    ├── knowledge-base/
    │   ├── page.tsx               # Add filter panel + sorting
    │   └── [slug]/
    │       └── page.tsx           # Add rating, bookmark, glossary tooltip
    └── globals.css                # Add light theme colors
```

---

## 🎯 Success Metrics by Feature

| Feature | Metric | Target | Timeline |
|---------|--------|--------|----------|
| Tech Stack Selector | % developers using selector | 50% | Week 4 |
| Advanced Search | Avg search time reduction | 40% | Week 4 |
| Bookmarking | % articles bookmarked per user | 5-10% | Week 6 |
| Checklists | % developers completing checklist | 30% | Week 8 |
| Code Examples | Code snippet copies per month | 100+ | Week 8 |
| Learning Paths | % developers starting a path | 25% | Week 8 |
| Ratings | Articles rated (avg rating > 4.0) | 80% | Week 8 |
| Accessibility | WCAG 2.1 AA compliance | 100% | Week 12 |
| Offline Mode | Offline session % of total | 5-10% | Week 12 |

---

## ⚡ Quick Start Commands

```bash
# Install new dependencies (as needed per phase)
npm install next-pwa next-intl zustand clsx

# For syntax highlighting
npm install prism-react-renderer prism

# For visualizations (Phase 2C)
npm install recharts

# For code export
npm install jspdf html2canvas

# Development
npm run dev

# Build & test
npm run build
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📞 Decision Points Requiring Leadership Input

Before starting implementation, clarify:

1. **Database**: PostgreSQL vs MongoDB vs Firebase?
   - **Impact**: All persistent feature development
   - **Timeline**: Decision by Week 1

2. **Authentication**: Required for Phase 2B?
   - **Impact**: Learning paths, bookmarks, ratings sharing
   - **Timeline**: Decision by Week 2

3. **Analytics Privacy**: Track all data or anonymous only?
   - **Impact**: Analytics dashboard, compliance
   - **Timeline**: Decision by Week 3

4. **Translation Budget**: For multi-language support?
   - **Impact**: i18n implementation
   - **Timeline**: Decision by Week 10

5. **DAST Vendor**: Internal orchestration or vendor integration?
   - **Impact**: DAST integration architecture
   - **Timeline**: Decision by Week 7

---

## 📖 Reference Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

**Created**: January 20, 2026  
**For questions**: Contact the Velox Product Team

