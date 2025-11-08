# Updated Tailwind Config - Usage Guide

## Overview

Your Tailwind config has been updated to match the Elite Performer design system. This guide explains the changes and how to use the new utilities.

## Key Changes

### 1. Simplified Color System

- **Removed**: Separate `-dark` color variants (e.g., `primary-dark`, `neutral-dark`)
- **Approach**: Use Tailwind's `dark:` prefix instead for dark mode colors
- **Removed**: Legacy colors (`background`, `surface`, `text-primary`, etc.)

### 2. Clean Color Palette

The color system now includes:

- `primary`: Main brand color (indigo/purple)
- `success`: For positive states and progress
- `accent`: For warnings, energy, highlights
- `neutral`: Grays for backgrounds, text, borders
- `error`, `warning`, `info`: Semantic colors

## Usage Examples

### Using Colors

#### Light Mode (Default)

```jsx
<div className="bg-neutral-0 text-neutral-900">
  Light mode background and text
</div>

<button className="bg-primary-500 text-white">
  Primary Button
</button>
```

#### Dark Mode

Use the `dark:` prefix for dark mode variants:

```jsx
<div className="bg-neutral-0 dark:bg-neutral-0 text-neutral-900 dark:text-neutral-900">
  Adapts to theme
</div>

<button className="bg-primary-500 dark:bg-primary-500">
  Button (different colors in dark mode per design system)
</button>
```

#### Cards & Surfaces

```jsx
<div className="bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200">
  Card with proper dark mode support
</div>
```

### Typography

Use the custom font sizes:

```jsx
<h1 className="text-h1">Page Title</h1>
<h2 className="text-h2">Section Header</h2>
<h3 className="text-h3">Card Title</h3>
<p className="text-body">Body text</p>
<span className="text-caption">Caption text</span>
<span className="text-overline">Category</span>
```

### Spacing

Use the 4px-based spacing system:

```jsx
<div className="p-4">16px padding</div>
<div className="m-6">24px margin</div>
<div className="gap-3">12px gap</div>
<section className="py-8">32px vertical padding</section>
```

### Border Radius

```jsx
<div className="rounded">8px - default</div>
<div className="rounded-sm">6px - small</div>
<div className="rounded-lg">12px - large cards</div>
<div className="rounded-xl">16px - prominent cards</div>
<div className="rounded-full">pills & avatars</div>
```

### Shadows

```jsx
// Light mode shadows
<div className="shadow">Default shadow</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow (elevated cards)</div>

// Dark mode shadows (automatically applied)
<div className="shadow dark:shadow-dark">Adaptive shadow</div>
```

### Transitions

```jsx
<button className="transition">Default 150ms</button>
<div className="transition-slow">Slow 300ms</div>
```

## Component Examples

### Button - Primary

```jsx
<button
  className="
  bg-primary-500 hover:bg-primary-600 active:bg-primary-700
  dark:bg-primary-500 dark:hover:bg-primary-600
  text-white
  px-6 py-3
  rounded-lg
  font-semibold text-body-sm
  transition
  shadow-sm hover:shadow-md
"
>
  Primary Button
</button>
```

### Button - Secondary

```jsx
<button
  className="
  bg-transparent
  border border-neutral-300 dark:border-neutral-200
  text-neutral-900 dark:text-neutral-900
  px-6 py-3
  rounded-lg
  font-semibold text-body-sm
  transition
  hover:bg-neutral-50 dark:hover:bg-neutral-100
"
>
  Secondary Button
</button>
```

### Card

```jsx
<div
  className="
  bg-neutral-0 dark:bg-neutral-100
  border border-neutral-200 dark:border-neutral-200
  rounded-lg
  p-6
  shadow hover:shadow-lg dark:hover:shadow-dark-lg
  transition-all duration-200
"
>
  <h3 className="text-h4 text-neutral-900 dark:text-neutral-900 mb-2">Card Title</h3>
  <p className="text-body-sm text-neutral-600 dark:text-neutral-600">Card content</p>
</div>
```

### Stat Card

```jsx
<div
  className="
  bg-neutral-0 dark:bg-neutral-100
  border border-neutral-200 dark:border-neutral-200
  rounded-lg
  p-6
  shadow hover:shadow-lg
  hover:-translate-y-1
  transition-all duration-200
  cursor-pointer
"
>
  <div className="flex items-center justify-between mb-4">
    <span className="text-caption text-neutral-500 dark:text-neutral-500 uppercase">
      Coding Progress
    </span>
    <div
      className="
      w-12 h-12
      bg-primary-50 dark:bg-primary-500/15
      text-primary-600 dark:text-primary-500
      rounded-lg
      flex items-center justify-center
    "
    >
      {/* Icon */}
    </div>
  </div>
  <div className="text-h1 text-neutral-900 dark:text-neutral-900 mb-1">1%</div>
  <div className="text-body-sm text-neutral-500 dark:text-neutral-500">0 courses completed</div>
</div>
```

### Badge

```jsx
<span
  className="
  inline-block
  px-3 py-1
  bg-success-100 dark:bg-success-700/15
  text-success-700 dark:text-success-500
  rounded-full
  text-caption
  font-semibold
  uppercase
"
>
  Active
</span>
```

### Input Field

```jsx
<input
  type="text"
  className="
    w-full
    bg-neutral-0 dark:bg-neutral-50
    border border-neutral-300 dark:border-neutral-200
    rounded-lg
    px-4 py-3
    text-body text-neutral-900 dark:text-neutral-900
    placeholder:text-neutral-400 dark:placeholder:text-neutral-400
    focus:border-primary-500 dark:focus:border-primary-400
    focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20
    transition
  "
  placeholder="Enter text..."
/>
```

## CSS Variables Approach (Alternative)

If you prefer CSS variables, use the included `design-system.css` file:

```css
/* In your global CSS */
@import './design-system.css';

/* Then use in components */
.my-component {
  background: var(--background);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

## Dark Mode Setup

Make sure your app has dark mode detection set up:

```jsx
// In your root layout or app component
'use client';

import { useEffect, useState } from 'react';

export default function RootLayout({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    const isDarkMode =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  return (
    <html lang="en" className={isDark ? 'dark' : ''}>
      <body>{children}</body>
    </html>
  );
}
```

## Migration from Old Config

### Old Code → New Code

```jsx
// OLD - Legacy colors
<div className="bg-background dark:bg-background-dark">

// NEW - Design system colors
<div className="bg-neutral-0 dark:bg-neutral-0">

// OLD - Text colors
<span className="text-text-primary dark:text-text-primary-dark">

// NEW - Neutral colors
<span className="text-neutral-900 dark:text-neutral-900">

// OLD - Accent colors
<button className="bg-accent-blue dark:bg-accent-blue-dark">

// NEW - Primary colors
<button className="bg-primary-500 dark:bg-primary-500">
```

## Best Practices

1. **Use semantic colors**: Choose `success` for positive states, `error` for errors, etc.
2. **Follow the neutral scale**:
   - `neutral-0`: Main backgrounds
   - `neutral-50-100`: Secondary surfaces, cards in dark mode
   - `neutral-200-300`: Borders, dividers
   - `neutral-500-600`: Body text, secondary text
   - `neutral-900`: Primary text, headings
3. **Consistent spacing**: Stick to the 4px grid (use `p-4`, `m-6`, etc.)
4. **Always add dark mode**: Use `dark:` prefix for all color utilities
5. **Use design tokens**: Follow the design system guidelines for consistency

## Common Patterns

### Page Layout

```jsx
<div className="min-h-screen bg-neutral-50 dark:bg-neutral-50">
  <main className="max-w-7xl mx-auto px-6 py-8">{/* Content */}</main>
</div>
```

### Section Header

```jsx
<div className="mb-8">
  <h1 className="text-h1 text-neutral-900 dark:text-neutral-900 mb-2">Dashboard</h1>
  <p className="text-body text-neutral-600 dark:text-neutral-600">
    Your 180-day transformation overview
  </p>
</div>
```

### Loading State

```jsx
<div className="animate-pulse">
  <div className="h-4 bg-neutral-200 dark:bg-neutral-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-neutral-200 dark:bg-neutral-200 rounded w-1/2"></div>
</div>
```

## Support

Refer to the `elite-performer-design-system.md` for complete design guidelines and specifications.
