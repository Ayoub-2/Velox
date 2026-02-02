# Final Polish & Localization Plan

## Goal
Update the Landing Page to reflect project completion and add French Language support (`fr`) to the application.

## Proposed Changes

### 1. Localization Engine (Lightweight)
#### [NEW] [src/lib/i18n.ts](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/lib/i18n.ts)
- **Content**: Dictionary object containing `en` and `fr` translations for Landing Page, Navbar, and common terms.
- **Type**: `TranslationDictionary`.

#### [NEW] [src/context/LanguageContext.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/context/LanguageContext.tsx)
- **Component**: React Context to manage `language` state ('en' | 'fr').
- **Persistence**: Save to `localStorage`.

#### [NEW] [src/components/ui/LanguageSwitcher.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/components/ui/LanguageSwitcher.tsx)
- **Component**: Toggle button (Flag or Text) to switch languages.

### 2. Integration
#### [MODIFY] [src/app/layout.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/layout.tsx)
- **Action**: Wrap application in `LanguageProvider`.

#### [MODIFY] [src/components/Navbar.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/components/Navbar.tsx)
- **Action**: Add `LanguageSwitcher` to the navigation bar.
- **Action**: Translate menu items.

### 3. Landing Page Updates
#### [MODIFY] [src/app/page.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/page.tsx)
- **Content**:
    - Update "Phase 3" status to "Live" (was "Analytics").
    - Mark all phases as completed.
    - Replace hardcoded text with `useLanguage()` keys.

## Verification Plan
### Manual Verification
1.  **Landing Page**:
    - Visit `/`.
    - **Expect**: "Analytics" card shows "Live" (Green).
    - **Expect**: Text is in English by default.
2.  **Language Switch**:
    - Click "FR" toggle in Navbar.
    - **Expect**: Landing page text changes to French immediately.
    - **Expect**: "Knowledge Base" -> "Base de Connaissances", etc.
    - Refresh page. **Expect**: French persists.
