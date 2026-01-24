# Velox Features - Visual Roadmap & Quick Reference

**Last Updated**: January 20, 2026

---

## 📅 Timeline Visualization

```
WEEKS:    1    2    3    4    5    6    7    8    9   10   11   12
PHASE:    ────────────────────────────────────────────────────────────
          └─ Phase 2A ─┘└─────── Phase 2B ───────┘└─ Phase 2C ─┘

TIER 1 (🟢 Easy):
  Tech Stack Selector         ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Advanced Search             ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Bookmarking                 ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Content Ratings             ░░░░████░░░░░░░░░░░░░░░░░░░░░░░░
  Glossary                    ░░░░░░░░████░░░░░░░░░░░░░░░░░░░░

TIER 2A (🟡 Medium - High Priority):
  Learning Paths              ░░░░░░░████░░░░░░░░░░░░░░░░░░░░░
  Checklists                  ░░░░░░░░████░░░░░░░░░░░░░░░░░░░░
  Code Examples DB            ░░░░░░░░░░░████░░░░░░░░░░░░░░░░░
  Comparison Matrices         ░░░░░░░░░░░░░░████░░░░░░░░░░░░░░
  Article Versioning          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  DAST Integration Prep       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Accessibility + Theme       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

TIER 3 (🔴 Hard):
  Offline Mode                ░░░░░░░░░░░░░░░░░░░░████░░░░░░░░
  Search Analytics            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

PHASE 3+ (🟣 Architectural):
  Multi-Language i18n         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Scorecard Dashboard         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

---

## 🎯 Feature Priority Matrix

```
IMPACT/VALUE
    ▲
    │  🔴 HIGH IMPACT      📍 Quick Wins        🔴 HARD WORK
    │                      ├─ Tech Stack       ├─ Offline Mode
    │                      ├─ Search           ├─ Analytics
    │                      ├─ Bookmarks        └─ i18n
    │                      ├─ Checklists
    │                      ├─ Learning Paths
    │                      └─ Accessibility
    │
    │  📍 MEDIUM IMPACT    🟡 MEDIUM EFFORT   📍 NICE-TO-HAVE
    │  ├─ Glossary        ├─ Ratings         ├─ Comparisons
    │  ├─ Code Examples   ├─ Versioning      ├─ DAST Prep
    │  └─ Scorecard       └─ (others)        └─ Scorecard
    │
    └──────────────────────────────────────────────────► EFFORT
         EASY              MEDIUM              HARD
    
Legend: 📍 = Recommended priority, 🔴 = Critical path
```

---

## 📊 Implementation Overview by Phase

### Phase 2A: Quick Wins ✅ (Weeks 1-3, 8.5 weeks effort)

**Features**:
1. **Tech Stack Selector** - Filter KB by tech (Node, Python, Go, etc.)
2. **Advanced Search** - Multi-filter search with category, difficulty, stack
3. **Bookmarking** - Save articles for later reading
4. **Content Ratings** - 5-star ratings + "helpful" poll
5. **Glossary** - 100+ security term definitions

**Key Metrics**:
- 50% developer adoption of selectors
- 40% reduction in search time
- 4.0+ average article rating

**Blockers**: None ✅

---

### Phase 2B: Core Features 🟡 (Weeks 4-8, 22 weeks effort)

**Must-Do**:
1. **Checklists** - Tech-stack-specific security checklists
2. **Code Examples DB** - Searchable code snippets with syntax highlighting
3. **Learning Paths** - Structured security courses (Beginner → Advanced)
4. **Accessibility** - Light theme + WCAG 2.1 AA compliance
5. **DAST Integration Prep** - Architecture + scaffolding for Phase 2

**Nice-to-Have**:
6. **Article Versioning** - Track changes and changelog
7. **Comparison Matrices** - JWT vs Sessions, Encryption methods, etc.

**Key Metrics**:
- 30% of developers using checklists before deployment
- 60% of code snippets used monthly
- 70% learning path completion rate

**Blockers**:
- ⚠️ Database decision (PostgreSQL or MongoDB)
- ⚠️ Privacy review for analytics
- ⚠️ DAST architecture alignment

---

### Phase 2C: Advanced Features 🔴 (Weeks 9-12, 10.5 weeks effort)

**Priority**:
1. **Offline Mode** - PWA support, cache all articles locally
2. **Search Analytics Dashboard** - Track trending topics + knowledge gaps
3. **Learning Path Analytics** - Course completion tracking

**Deferred**:
- Multi-language (Phase 3 decision)
- Scorecard Dashboard (depends on DAST Phase 2)

**Key Metrics**:
- 10% of sessions work offline
- Identify top 5 knowledge gaps from search queries
- 80% of developers complete ≥1 learning path

**Blockers**:
- ⚠️ Browser compatibility testing
- ⚠️ Privacy/compliance sign-off for analytics

---

### Phase 3: Future Vision 🟣 (Phase 3, 10-15 weeks effort)

**Scheduled for later**:
1. **Multi-Language Support** - Spanish, Chinese, German, etc.
2. **Scorecard Dashboard** - Security posture tracking per team
3. **Advanced Analytics** - ML recommendations, vulnerability trends

**Dependencies**:
- Phase 2 DAST integration complete
- Database production-ready
- Translation budget approved

---

## 📈 Adoption Curve Projection

```
ADOPTION %
    │
 60 │              ┌─────── Phase 2 Plateau
    │            /
 50 │          /
    │        /      ╱╲
 40 │      /       ╱  ╲
    │    /       ╱      ╲      ┌─── Phase 3 Growth
 30 │  /       ╱          ╲    ╱
    │╱       ╱              ╲  ╱
 20 │      ╱                  ╲╱
    │    ╱
 10 │  ╱
    │╱
  0 └────────────────────────────────────────
    W1  W2  W3  W4  W5  W6  W7  W8  W9 W10 W11 W12

Legend:
  Phase 2A: Quick Wins launch
  Phase 2B: Core features + engagement spike
  Phase 2C: Advanced features + stabilization
  Phase 3: Foundation work + planning

Projected end-of-Phase-2 adoption: 60%+ developers
```

---

## 🛠️ Feature Dependencies Map

```
                 ┌─ Tech Stack Selector ─┐
                 │                       │
         ┌───────┴──────┐                │
         │              │                │
    Advanced Search   Checklists ◄───────┘
         │
    Bookmarks  ─────────┐
         │              │
    Learning Paths ─────┼─► Code Examples DB
         │              │
    Comparison Matrices │
         │              │
    Ratings ────────────┘
         │
    Glossary
         │
    Article Versioning
         │
    Offline Mode ────────┐
         │               │
    Search Analytics ────┴─► DAST Integration
         │
    Accessibility & Theme
         │
    i18n (Multi-language)
         │
    Scorecard Dashboard

Key: ──► = dependency/prerequisite
     │   = no dependency
```

---

## 💾 Data Persistence Strategy

```
PHASE 2A (No Database)
┌─────────────────────────┐
│ Component  │ Storage   │ 
├─────────────────────────┤
│ Tech Stack │ localStorage│
│ Bookmarks  │ localStorage│
│ Ratings    │ localStorage│
│ Search Prefs│ localStorage│
│ Glossary   │ File-based  │
└─────────────────────────┘

PHASE 2B (Optional Database)
┌──────────────────────────┐
│ Component   │ Storage    │
├──────────────────────────┤
│ Checklists  │ localStorage│
│ Learning P. │ localStorage│
│ Versioning  │ Git + DB*   │
│ Comparison  │ File-based  │
└──────────────────────────┘
*Optional: Git for MVP

PHASE 2C & 3 (Database Required)
┌──────────────────────────┐
│ Component   │ Storage    │
├──────────────────────────┤
│ Analytics   │ PostgreSQL  │
│ Scorecard   │ PostgreSQL  │
│ Users       │ PostgreSQL  │
│ i18n        │ File + DB   │
└──────────────────────────┘
```

---

## 🚀 Resource Allocation Scenarios

### Scenario 1: Single Engineer (1 FTE)
```
Week  1-3: Tech Stack, Search, Bookmarks       (3 weeks)
Week  4-5: Ratings + Glossary                  (2 weeks)
Week  6-8: Checklists + Code Examples          (3 weeks)
Week  9-10: Learning Paths + Versioning        (2 weeks)
Week  11-12: Accessibility + Comparisons       (2 weeks)
           ─────────────
           12 weeks → 10 features complete

Remaining: Offline Mode, Analytics, DAST Prep (Phase 3)
```

### Scenario 2: Two Engineers (2 FTE) - RECOMMENDED
```
ENGINEER 1              ENGINEER 2
Week 1-3:
├─ Tech Stack          ├─ Bookmarks
├─ Advanced Search     └─ (Support)

Week 4-5:
├─ Glossary            ├─ Content Ratings
└─ (Content work)      └─ (Content work)

Week 6-8:
├─ Checklists          ├─ Code Examples
├─ Learning Paths      ├─ Comparisons
└─ (Content work)      └─ (Content work)

Week 9-12:
├─ Versioning          ├─ Offline Mode
├─ Accessibility       ├─ Analytics
├─ DAST Prep           └─ Scorecard (planning)
└─ (Support)

Result: 13+ features by week 12 ✅
```

---

## 📊 Effort Breakdown by Category

```
EFFORT ALLOCATION (51 weeks total)

UI/Component Dev      ███████░░░░░░░░░░░░░░░ (22 weeks, 43%)
Content Creation      █████░░░░░░░░░░░░░░░░░ (12 weeks, 24%)
Backend/Logic         ████░░░░░░░░░░░░░░░░░░  (8 weeks, 16%)
Testing               ███░░░░░░░░░░░░░░░░░░░  (5 weeks, 10%)
Docs/DevOps          ██░░░░░░░░░░░░░░░░░░░░  (4 weeks, 8%)
                     ─────────────────────────
                     51 weeks total

PER PHASE:
Phase 2A: UI Dev (40%) + Testing (20%)
Phase 2B: UI Dev (35%) + Content (30%) + Backend (15%)
Phase 2C: Backend (40%) + Testing (30%) + UI (20%)
Phase 3:  Content (40%) + Backend (35%) + UI (15%)
```

---

## 🎓 Technology Stack Required

```
PHASE 2A (No new packages)
├─ React 19.2.3 ✅
├─ Next.js 16.1.1 ✅
├─ TailwindCSS 4.x ✅
└─ TypeScript 5.x ✅

PHASE 2B (Add lightweight utilities)
├─ zustand @2.5KB (state management)
├─ clsx @1.5KB (utility classes)
├─ prism.js @5KB (syntax highlighting)
└─ jsPDF @100KB (optional: PDF exports)

PHASE 2C (Add UI/PWA libraries)
├─ next-pwa @20KB (offline support)
├─ lunr.js @30KB (client-side search)
├─ recharts @50KB (data visualization)
└─ highlight.js @9KB (alternative highlighter)

PHASE 3 (Backend + i18n)
├─ next-intl @15KB (internationalization)
├─ prisma (database ORM)
├─ PostgreSQL (database)
└─ socket.io @30KB (optional: real-time)

TOTAL BUNDLE ADDITION: ~175 KB gzipped (acceptable)
```

---

## ✅ Success Criteria Checklist

### Phase 2A Completion (Week 3)
- [ ] Tech Stack Selector working for all major stacks
- [ ] Search loads in <200ms with all filters
- [ ] Bookmarks persisted across sessions
- [ ] Ratings display aggregated scores
- [ ] Glossary has 50+ terms indexed
- [ ] 4.0+ average article rating

### Phase 2B Completion (Week 8)
- [ ] 15+ checklists created and tested
- [ ] 50+ code snippets extracted and highlighted
- [ ] 5+ learning paths with 100% completion tracking
- [ ] 8+ comparison matrices created
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Article versioning with changelog display

### Phase 2C Completion (Week 12)
- [ ] Offline mode works on Chrome, Firefox, Safari
- [ ] Analytics dashboard shows trending topics
- [ ] 10+ knowledge gaps identified from search data
- [ ] 70%+ of developers using at least 1 new feature
- [ ] <3s page load time across all features

### Phase 3 Preparation (By Week 12)
- [ ] i18n framework configured but not deployed
- [ ] Scorecard metrics algorithm documented
- [ ] Database schema reviewed and approved
- [ ] Translation budget approved (if pursuing i18n)

---

## 📞 Decision Points & Deadlines

| Decision | Deadline | Impact | Owner |
|----------|----------|--------|-------|
| **Database Choice** | Week 1 | All persistent features | Engineering Lead |
| **Article Metadata** | Week 2 | Tech stack filtering | Content Team |
| **Authentication** | Week 3 | Learning path sharing | Product Lead |
| **Privacy Review** | Week 4 | Analytics feature | Legal/Compliance |
| **DAST Architecture** | Week 6 | Phase 2B/3 planning | Security Lead |
| **Translation Budget** | Week 10 | i18n feasibility | Leadership |
| **Scorecard Metrics** | Week 11 | Phase 3 foundation | Security Lead |

---

## 🎯 Go/No-Go Gates

### Gate 1: Phase 2A Ready? (End of Week 3)
```
GO ✅ if:
  ✓ All Tier 1 features tested
  ✓ Average rating > 4.0
  ✓ <5% critical bugs
  ✓ Developer feedback positive
```

### Gate 2: Phase 2B Start? (Start of Week 4)
```
GO CONDITIONAL if:
  ✓ Database decision made
  ✓ Article metadata complete
  ✓ Privacy review in progress
  BLOCKED if privacy review fails
```

### Gate 3: Phase 2C Start? (Start of Week 9)
```
GO ✅ if:
  ✓ Phase 2B features in production
  ✓ <2% critical bugs
  ✓ Database stable
  ✓ User engagement >50%
```

### Gate 4: Phase 3 Planning? (Week 11)
```
GO ✅ if:
  ✓ Phase 2 features at 90% stability
  ✓ Leadership approval for Phase 3
  ✓ DAST integration progressing
  ✓ Budget allocated for i18n (if pursuing)
```

---

## 📊 Risk Dashboard

```
RISK LEVEL              LIKELIHOOD    IMPACT    MITIGATION
─────────────────────────────────────────────────────────
Database delays         Medium        High      Decide Week 1
i18n scope creep        High          Medium    Defer to Phase 3
PWA testing             High          Medium    Budget time
Content quality         Medium        Medium    Review process
Performance regression  Low           Medium    CI/CD setup
Analytics privacy       Medium        High      Legal review early

Overall Risk: 🟡 MEDIUM (Manageable with planning)
```

---

## 💡 Pro Tips for Success

1. **Start Phase 2A immediately** - No blockers, high ROI
2. **Parallelize Engineer Pairs** - 2 engineers deliver in 10 weeks vs. 1 engineer in 20+
3. **Content Creation is 25% of Work** - Budget time for glossary, checklists, learning paths
4. **Test Early, Test Often** - Especially for PWA (offline mode) and i18n
5. **Get Privacy Review Early** - Analytics feature needs compliance sign-off
6. **Database Decision ASAP** - Blocks versioning, DAST prep, scorecard features
7. **User Feedback Loop** - Gather feedback after each phase for Phase 3 planning
8. **Performance Matters** - Add Lighthouse CI from start

---

## 📚 Related Documents

- **[FEATURE_PROPOSALS.md](FEATURE_PROPOSALS.md)** - Full business case (5,000+ words)
- **[FEASIBILITY_ASSESSMENT.md](FEASIBILITY_ASSESSMENT.md)** - Technical deep-dive (40+ pages)
- **[IMPLEMENTATION_REFERENCE.md](IMPLEMENTATION_REFERENCE.md)** - Code templates & patterns
- **[FEASIBILITY_EXECUTIVE_SUMMARY.md](FEASIBILITY_EXECUTIVE_SUMMARY.md)** - Executive brief

---

**Created**: January 20, 2026  
**Updated**: January 20, 2026  
**Status**: Ready for implementation planning

*Questions? Contact: Velox Product Team*

