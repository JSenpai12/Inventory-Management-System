// FILE: tailwind.config.js
// PURPOSE: the design tokens (dark theme with green accent, inspired by the eMart reference).
// WHAT TO DO: change the 4 colors below to re-skin the whole app. Use them as bg-bg, bg-panel, border-line, text-brand.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { bg: '#0a0c0d', panel: '#111415', line: '#1f2528', brand: '#34d399' } } },
}
