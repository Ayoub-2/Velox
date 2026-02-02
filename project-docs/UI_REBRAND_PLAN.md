# implementation_plan - Orange & Brown UI Rebranding

## Goal
Switch the application's visual identity to an "Orange & Brown" theme as requested.

## Concept
Instead of rewriting every component class, we will override the underlying Tailwind color palette in `src/app/globals.css`.
*   **Neutral (Backgrounds/Borders)**: Replace `slate` (cool grey) with `stone` (warm/brownish grey).
*   **Primary (Actions/Accents)**: Replace `blue`/`indigo` with `orange`.
*   **Secondary**: Replace `cyan`/`sky` with `amber`.

## Proposed Changes

### [MODIFY] [src/app/globals.css](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/globals.css)
Add a `@theme` block to override default colors:

```css
@theme {
    /* Override 'slate' (used for bg-slate-900 etc) with 'stone' colors */
    --color-slate-50: var(--color-stone-50);
    --color-slate-100: var(--color-stone-100);
    --color-slate-200: var(--color-stone-200);
    --color-slate-300: var(--color-stone-300);
    --color-slate-400: var(--color-stone-400);
    --color-slate-500: var(--color-stone-500);
    --color-slate-600: var(--color-stone-600);
    --color-slate-700: var(--color-stone-700);
    --color-slate-800: var(--color-stone-800);
    --color-slate-900: var(--color-stone-900);
    --color-slate-950: var(--color-stone-950);

    /* Override 'blue' (used for buttons/accents) with 'orange' */
    --color-blue-50: var(--color-orange-50);
    --color-blue-500: var(--color-orange-500);
    --color-blue-600: var(--color-orange-600);
    /* ... map crucial shades ... */
}
```

## Verification
1.  **Visual Check**: Restart the development server (`docker-compose up --build`) and browse the app.
    *   Ref: Backgrounds should look warm/earthy (Stone).
    *   Ref: Buttons and highlights should be Orange.
