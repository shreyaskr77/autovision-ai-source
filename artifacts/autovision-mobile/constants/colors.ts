/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#0a0a0a',
    tint: '#2f95dc',

    // Core surfaces
    background: '#F3F6FA',
    foreground: '#0B1220',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#0B1220',

    // Primary action color (buttons, links, active states)
    primary: '#3B82F6',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7EEF8',
    secondaryForeground: '#17243A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#E7EEF8',
    mutedForeground: '#64748B',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#DCEBFF',
    accentForeground: '#1D4ED8',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#D9E2F0',
    input: '#D9E2F0',
  },
  dark: {
    text: '#F8FAFC',
    tint: '#3B82F6',
    background: '#0B1220',
    foreground: '#F8FAFC',
    card: '#111827',
    cardForeground: '#F8FAFC',
    primary: '#3B82F6',
    primaryForeground: '#FFFFFF',
    secondary: '#1A2740',
    secondaryForeground: '#DBEAFE',
    muted: '#1A2740',
    mutedForeground: '#94A3B8',
    accent: '#15315C',
    accentForeground: '#BFDBFE',
    destructive: '#F87171',
    destructiveForeground: '#240B0B',
    border: '#243450',
    input: '#243450',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
