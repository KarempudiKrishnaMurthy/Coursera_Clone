---
description: Mandatory frontend UI engineering standard. Enforce before generating or modifying any UI code.
always_on: true
---

# Mandatory Frontend UI Engineering Review

Before generating or modifying any user-facing UI code (React components, pages, styles, layouts, interactions), review and strictly adhere to `.agents/skills/frontend-ui-engineering/SKILL.md`:

1. **Component Quality**:
   - Prefer composition over configuration (`<Card><CardHeader>...</CardHeader></Card>`).
   - Keep components focused and under 200 lines (split when needed).
   - Colocate component logic, types, and presentation; separate data fetching from presentation.

2. **Design System & Aesthetics**:
   - Use the project's actual design system tokens, CSS variables, and Tailwind scale.
   - Avoid generic "AI aesthetic": no arbitrary pixel values, no excessive unbranded gradients, no uniform oversized rounding or padding.
   - Respect typography scale (single `h1` per page, no skipped heading levels) and contrast ratios (4.5:1 text, 3:1 components).

3. **WCAG 2.1 AA Accessibility**:
   - Every interactive element must be keyboard accessible with visible focus rings.
   - Proper labels (`<label>`, `aria-label`) on all form inputs and icon buttons.
   - Focus management for dialogs/modals (trap on open, return on close).
   - Informative empty, loading (skeletons), error, and success states.

4. **Responsive Layout**:
   - Mobile-first approach tested across breakpoints (320px, 768px, 1024px, 1440px).
