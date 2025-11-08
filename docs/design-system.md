# Elite Performer - Design System

## 🎨 Brand Identity

**Core Values:**

- Excellence & Achievement
- Focus & Clarity
- Growth & Progress
- Balance & Consistency

**Design Principles:**

1. **Clarity First** - Information should be easy to scan and understand
2. **Purposeful Motion** - Animations should guide and delight, not distract
3. **Consistent Patterns** - Users should feel at home across all screens
4. **Data-Driven Design** - Visualize progress in meaningful ways

---

## 🌈 Color Palette

### Light Theme

**Primary Colors:**

- `primary-50`: #F0F4FF
- `primary-100`: #E0E9FF
- `primary-200`: #C7D7FE
- `primary-300`: #A4BCFD
- `primary-400`: #8098F9
- `primary-500`: #6366F1 (Main Primary)
- `primary-600`: #4F46E5
- `primary-700`: #4338CA
- `primary-800`: #3730A3
- `primary-900`: #312E81

**Secondary Colors (Success/Progress):**

- `success-50`: #F0FDF4
- `success-100`: #DCFCE7
- `success-500`: #10B981 (Main Success)
- `success-600`: #059669
- `success-700`: #047857

**Accent Colors:**

- `accent-50`: #FFF7ED
- `accent-100`: #FFEDD5
- `accent-500`: #F59E0B (Warnings/Energy)
- `accent-600`: #D97706

**Neutral Colors:**

- `neutral-0`: #FFFFFF (Background)
- `neutral-50`: #F9FAFB (Secondary Background)
- `neutral-100`: #F3F4F6 (Tertiary Background)
- `neutral-200`: #E5E7EB (Borders)
- `neutral-300`: #D1D5DB (Dividers)
- `neutral-400`: #9CA3AF (Disabled)
- `neutral-500`: #6B7280 (Secondary Text)
- `neutral-600`: #4B5563 (Body Text)
- `neutral-700`: #374151
- `neutral-800`: #1F2937 (Headings)
- `neutral-900`: #111827 (Primary Text)

**Semantic Colors:**

- `error-500`: #EF4444 (Errors)
- `error-600`: #DC2626
- `warning-500`: #F59E0B (Warnings)
- `info-500`: #3B82F6 (Information)

### Dark Theme

**Primary Colors:**

- `primary-50`: #312E81
- `primary-100`: #3730A3
- `primary-200`: #4338CA
- `primary-300`: #4F46E5
- `primary-400`: #6366F1
- `primary-500`: #818CF8 (Main Primary)
- `primary-600`: #A4BCFD
- `primary-700`: #C7D7FE
- `primary-800`: #E0E9FF
- `primary-900`: #F0F4FF

**Secondary Colors:**

- `success-50`: #047857
- `success-100`: #059669
- `success-500`: #10B981 (Main Success)
- `success-600`: #34D399
- `success-700`: #6EE7B7

**Accent Colors:**

- `accent-50`: #92400E
- `accent-100`: #B45309
- `accent-500`: #F59E0B (Warnings/Energy)
- `accent-600`: #FBBF24

**Neutral Colors:**

- `neutral-0`: #0A0A0B (Background)
- `neutral-50`: #1A1A1D (Secondary Background)
- `neutral-100`: #27272A (Tertiary Background/Cards)
- `neutral-200`: #3F3F46 (Borders)
- `neutral-300`: #52525B (Dividers)
- `neutral-400`: #71717A (Disabled)
- `neutral-500`: #A1A1AA (Secondary Text)
- `neutral-600`: #D4D4D8 (Body Text)
- `neutral-700`: #E4E4E7
- `neutral-800`: #F4F4F5 (Headings)
- `neutral-900`: #FAFAFA (Primary Text)

**Semantic Colors:**

- `error-500`: #F87171
- `error-600`: #EF4444
- `warning-500`: #FBBF24
- `info-500`: #60A5FA

---

## 📝 Typography

**Font Families:**

- **Primary (Sans-serif):** Inter or System UI stack
  - `font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Monospace (for code/data):** 'SF Mono', 'Monaco', 'Cascadia Code', monospace

**Type Scale:**

| Name       | Size | Weight          | Line Height | Use Case            |
| ---------- | ---- | --------------- | ----------- | ------------------- |
| Display    | 48px | 700             | 1.1         | Hero sections       |
| H1         | 36px | 700             | 1.2         | Page titles         |
| H2         | 30px | 600             | 1.3         | Section headers     |
| H3         | 24px | 600             | 1.4         | Card titles         |
| H4         | 20px | 600             | 1.4         | Subsection headers  |
| H5         | 18px | 600             | 1.5         | Small headers       |
| Body Large | 18px | 400             | 1.6         | Important body text |
| Body       | 16px | 400             | 1.6         | Default body text   |
| Body Small | 14px | 400             | 1.5         | Secondary text      |
| Caption    | 12px | 500             | 1.4         | Labels, captions    |
| Overline   | 11px | 600 (uppercase) | 1.5         | Category labels     |

**Font Weights:**

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 📏 Spacing System

Use a consistent 4px base unit:

```
spacing-1: 4px
spacing-2: 8px
spacing-3: 12px
spacing-4: 16px
spacing-5: 20px
spacing-6: 24px
spacing-7: 28px
spacing-8: 32px
spacing-10: 40px
spacing-12: 48px
spacing-16: 64px
spacing-20: 80px
spacing-24: 96px
```

**Common Patterns:**

- Component padding: 16px (spacing-4)
- Card padding: 24px (spacing-6)
- Section spacing: 32px (spacing-8)
- Page margins: 24px mobile, 48px desktop

---

## 🎯 Component Styles

### Buttons

**Primary Button:**

```css
Background: primary-500 (light) / primary-500 (dark)
Text: white
Height: 40px
Padding: 12px 24px
Border-radius: 8px
Font: 14px, weight 600
Shadow: 0 1px 2px rgba(0,0,0,0.05)
Hover: primary-600 background
Active: primary-700 background
```

**Secondary Button:**

```css
Background: transparent
Border: 1.5px solid neutral-300 (light) / neutral-200 (dark)
Text: neutral-900 (light) / neutral-900 (dark)
Height: 40px
Padding: 12px 24px
Border-radius: 8px
Font: 14px, weight 600
Hover: neutral-50 background (light) / neutral-100 (dark)
```

**Ghost Button:**

```css
Background: transparent
Text: primary-600 (light) / primary-400 (dark)
Height: 40px
Padding: 12px 24px
Border-radius: 8px
Font: 14px, weight 600
Hover: primary-50 background (light) / neutral-100 (dark)
```

### Cards

**Default Card:**

```css
Background: white (light) / neutral-100 (dark)
Border: 1px solid neutral-200 (light) / neutral-200 (dark)
Border-radius: 12px
Padding: 24px
Shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
Hover: Shadow elevated + subtle border color change
```

**Stats Card (for metrics):**

```css
Same as default card but with:
- Icon container with colored background (primary-50)
- Large number display
- Accent color for progress indicators
```

### Form Inputs

**Text Input:**

```css
Background: white (light) / neutral-50 (dark)
Border: 1.5px solid neutral-300 (light) / neutral-200 (dark)
Border-radius: 8px
Height: 44px
Padding: 12px 16px
Font: 16px
Focus: primary-500 border, 0 0 0 3px primary-100 ring (light)
       primary-400 border, 0 0 0 3px primary-900/20 ring (dark)
```

### Tags/Badges

**Status Badge:**

```css
Height: 24px
Padding: 4px 12px
Border-radius: 12px (pill shape)
Font: 12px, weight 600
Background varies by status:
- Active: success-100 bg, success-700 text (light)
- Pending: accent-100 bg, accent-700 text (light)
- Inactive: neutral-100 bg, neutral-600 text (light)
```

---

## 🎨 Visual Effects

### Shadows

**Light Theme:**

```css
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
```

**Dark Theme:**

```css
shadow-sm: 0 1px 2px rgba(0,0,0,0.3)
shadow: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)
shadow-md: 0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)
shadow-lg: 0 10px 15px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)
shadow-xl: 0 20px 25px rgba(0,0,0,0.6), 0 10px 10px rgba(0,0,0,0.4)
```

### Border Radius

```css
radius-sm: 6px (small elements)
radius: 8px (default)
radius-md: 10px (medium cards)
radius-lg: 12px (large cards)
radius-xl: 16px (prominent cards)
radius-full: 9999px (pills, avatars)
```

### Transitions

```css
Default transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)
Slow transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 📱 Responsive Breakpoints

```css
mobile: 0-639px
tablet: 640-1023px
desktop: 1024-1279px
wide: 1280px+
```

**Layout Patterns:**

- Mobile: Single column, full-width cards with 16px margins
- Tablet: 2 columns for cards, 24px margins
- Desktop: 3 columns, 32px margins, max-width 1400px
- Wide: Same as desktop but centered with more whitespace

---

## 🎯 Icon System

**Icon Library:** Lucide Icons (clean, consistent, MIT licensed)

**Sizes:**

- Small: 16px
- Default: 20px
- Medium: 24px
- Large: 32px

**Style:**

- Stroke width: 2px (default)
- Rounded corners
- Consistent with overall design language

---

## ✨ Animation Principles

1. **Purposeful:** Every animation should have a reason (feedback, guidance, delight)
2. **Fast:** Keep animations under 300ms for UI interactions
3. **Natural:** Use easing functions that feel natural (ease-out for entrances, ease-in for exits)
4. **Subtle:** Don't overdo it - less is more

**Common Animations:**

- Button hover: Scale 1.02, shadow increase (150ms)
- Card hover: Lift effect with shadow (200ms)
- Page transitions: Fade + slide (300ms)
- Loading states: Skeleton screens or subtle pulse
- Success states: Checkmark with scale animation

---

## 🎨 Data Visualization

**Progress Bars:**

- Height: 8px
- Border-radius: 4px
- Background: neutral-200 (light) / neutral-200 (dark)
- Fill: Gradient from primary-500 to primary-400
- Animate fill on change

**Charts:**

- Use primary colors for main data
- Use success colors for positive trends
- Use accent/warning for neutral or attention items
- Keep it minimal - remove unnecessary gridlines
- Use subtle animations on load

**Stats Display:**

- Large numbers in bold (H2 or H3)
- Metric label in caption style above
- Trend indicators with arrows and colors
- Progress rings for percentages

---

## 📋 Layout Grid

**Container Max-Width:** 1400px
**Columns:** 12-column grid
**Gutter:** 24px (desktop), 16px (mobile)

---

## ♿ Accessibility

1. **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus States:** Clear focus indicators (3px ring) on all interactive elements
3. **Touch Targets:** Minimum 44x44px for mobile
4. **Screen Readers:** Proper ARIA labels and semantic HTML
5. **Keyboard Navigation:** Full keyboard support

---

## 🎯 Component Checklist

For each component, ensure:

- [ ] Light theme version
- [ ] Dark theme version
- [ ] Hover state
- [ ] Active/pressed state
- [ ] Focus state
- [ ] Disabled state
- [ ] Loading state (if applicable)
- [ ] Error state (if applicable)
- [ ] Mobile responsive
- [ ] Accessibility compliant

---

## 🚀 Implementation Priority

1. **Phase 1:** Core colors, typography, spacing
2. **Phase 2:** Buttons, inputs, cards
3. **Phase 3:** Dashboard redesign
4. **Phase 4:** Other screens one by one
5. **Phase 5:** Animations and polish
