// Component Organization Guide

// This file documents how to reorganize existing components
// from /components to their respective domain folders

/\*\*

- MOVE TO: /components/auth/
-   - login-screen.tsx
      \*/

/\*\*

- MOVE TO: /components/signals/
-   - signal-card.tsx
-   - signal-strength.tsx
-   - emergency-alert.tsx
-   - broadcast-composer.tsx
      \*/

/\*\*

- MOVE TO: /components/layout/
-   - sidebar.tsx
-   - status-bar.tsx
-   - mobile-nav.tsx
      \*/

/\*\*

- MOVE TO: /components/common/
-   - scanlines.tsx
-   - noise-overlay.tsx
-   - crt-glow.tsx
-   - glitch-text.tsx
      \*/

/\*\*

- KEEP IN: /components/
-   - alerts-view.tsx (or move to /components/alerts/)
-   - memory-card.tsx
-   - resource-card.tsx
-   - sector-map.tsx
-   - settings-view.tsx
-   - survivor-profile.tsx
-   - trade-modal.tsx
-   - vault-view.tsx
      \*/

/\*\*

- KEEP IN: /components/ui/
-   - All shadcn/ui components (button, card, dialog, etc.)
-   - figma/ folder with ImageWithFallback.tsx
      \*/
