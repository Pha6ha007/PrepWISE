# Confide Design System
> A warm, personal, and trustworthy design language

---

## Design Philosophy

**NOT** playful/gamified (like Replika/Wysa with penguins)
**NOT** corporate/cold (like BetterHelp)
**BUT** — warm and personal like a premium Moleskine journal or a cozy café

### Core Principles

1. **Warmth** — Cream backgrounds, soft shadows, rounded corners
2. **Trust** — Indigo primary, clean typography, generous spacing
3. **Clarity** — Clear hierarchy, readable text, intuitive navigation
4. **Delight** — Smooth animations, polished interactions, attention to detail

---

## Typography

### Font Families

**Headings: Fraunces**
A warm, elegant serif typeface that adds personality and sophistication.
- Weights: 400, 500, 600, 700
- Usage: All h1-h6 elements, hero text, feature titles
- Variable: `--font-fraunces`
- Tailwind: `font-serif`

```jsx
<h1 className="font-serif text-5xl">Welcome to Confide</h1>
```

**Body Text: Plus Jakarta Sans**
A modern, highly readable sans-serif for all body content and UI elements.
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Usage: Body text, buttons, navigation, forms
- Variable: `--font-plus-jakarta-sans`
- Tailwind: `font-sans` (default)

```jsx
<p className="font-sans text-base">Your thoughts are safe here.</p>
```

### Type Scale

| Size | Tailwind | Pixels | Line Height | Usage |
|------|----------|--------|-------------|-------|
| xs   | `text-xs` | 12px | 1rem | Labels, captions |
| sm   | `text-sm` | 14px | 1.25rem | Secondary text |
| base | `text-base` | 16px | 1.5rem | Body text (default) |
| lg   | `text-lg` | 18px | 1.75rem | Large body, intro |
| xl   | `text-xl` | 20px | 1.75rem | Subheadings |
| 2xl  | `text-2xl` | 24px | 2rem | Section headers |
| 3xl  | `text-3xl` | 30px | 2.25rem | Page titles |
| 4xl  | `text-4xl` | 36px | 2.5rem | Hero subheadings |
| 5xl  | `text-5xl` | 48px | 1.2 | Hero headings |
| 6xl  | `text-6xl` | 60px | 1.1 | Landing hero |

### Typography Guidelines

- **Headings:** Use `font-serif` (Fraunces), weight 500-700, tight letter-spacing
- **Body:** Use `font-sans` (Plus Jakarta Sans), weight 400-600
- **Emphasis:** Use semibold (600) instead of bold when possible
- **Line Length:** Max 65-75 characters per line for readability
- **Line Height:** 1.5-1.75 for body, 1.1-1.3 for headings

---

## Color Palette

### Primary Colors

**Indigo** — Trust, calm, professionalism
```css
--primary: #6366F1
```
- Default: `#6366F1` (`bg-primary`, `text-primary`)
- Light: `#818CF8` (`bg-indigo-light`)
- Dark: `#4F46E5` (`bg-indigo-dark`)
- Usage: Primary CTAs, links, focus states, brand elements

**Amber** — Warmth, support, encouragement
```css
--warm-accent: #F59E0B
```
- Default: `#F59E0B` (`bg-warm`, `text-warm`)
- Light: `#FBBF24` (`bg-amber-light`)
- Dark: `#D97706` (`bg-amber-dark`)
- Usage: Accent elements, warm highlights, secondary CTAs

### Neutral Colors

**Background**
```css
--background: #FAFAF9  /* Cream, NOT pure white */
```
- Usage: Page backgrounds, subtle warmth

**Foreground (Text)**
```css
--foreground: #1F2937  /* Warm black, not harsh */
```
- Usage: Primary text content

**Muted Foreground**
```css
--muted-foreground: #6B7280  /* Gray */
--subtle-foreground: #9CA3AF  /* Light gray */
```
- Usage: Secondary text, metadata, placeholders

**Card**
```css
--card: #FFFFFF  /* Pure white for elevated surfaces */
```
- Usage: Cards, panels, elevated components

### Semantic Colors

**Destructive (Error/Warning)**
```css
--destructive: hsl(0 84.2% 60.2%)  /* Red */
```

---

## Spacing

Confide uses generous, airy spacing inspired by Notion and Linear.

### Scale

| Token | Size | Pixels | Usage |
|-------|------|--------|-------|
| 1 | 0.25rem | 4px | Minimal gaps |
| 2 | 0.5rem | 8px | Tight spacing |
| 3 | 0.75rem | 12px | Small gaps |
| 4 | 1rem | 16px | Default spacing |
| 6 | 1.5rem | 24px | Medium gaps |
| 8 | 2rem | 32px | Section spacing |
| 12 | 3rem | 48px | Large sections |
| 16 | 4rem | 64px | Major sections |
| 18 | 4.5rem | 72px | Extra large |
| 22 | 5.5rem | 88px | Hero sections |
| 30 | 7.5rem | 120px | Landing sections |

### Guidelines

- **Component padding:** `p-6` or `p-8` (24px-32px)
- **Section gaps:** `gap-12` to `gap-16` (48px-64px)
- **Button padding:** `px-6 py-3` (24px × 12px)
- **Card padding:** `p-8` or `p-10` (32px-40px)

---

## Border Radius

Warm, rounded corners — never sharp.

| Token | Size | Pixels | Usage |
|-------|------|--------|-------|
| sm | `rounded-sm` | 8px | Small elements, badges |
| md | `rounded-md` | 10px | Inputs, small buttons |
| lg | `rounded-lg` | 12px | Cards, panels (default) |
| xl | `rounded-xl` | 16px | Large cards, modals |
| 2xl | `rounded-2xl` | 24px | Hero sections |
| full | `rounded-full` | 9999px | Pills, avatars |

**Default:** Use `rounded-xl` (12px) for most components.

---

## Shadows

Multi-layered, subtle shadows inspired by Apple and Notion.

### Utility Classes

**Subtle Shadow**
```css
.shadow-subtle
```
- Usage: Small elevations, hover states
- Layers:
  - `0 1px 2px rgba(0, 0, 0, 0.04)`
  - `0 2px 6px rgba(0, 0, 0, 0.04)`

**Card Shadow**
```css
.shadow-card
```
- Usage: Default card elevation
- Layers:
  - `0 4px 12px rgba(0, 0, 0, 0.06)`
  - `0 2px 4px rgba(0, 0, 0, 0.04)`

**Large Shadow**
```css
.shadow-large
```
- Usage: Modals, dropdowns, popovers
- Layers:
  - `0 12px 32px rgba(0, 0, 0, 0.08)`
  - `0 4px 12px rgba(0, 0, 0, 0.04)`

### Guidelines

- Avoid harsh, single-layer shadows
- Use multiple subtle layers for depth
- Increase shadow on hover for interactivity

---

## Animations

Smooth, polished animations using Framer Motion and Tailwind.

### Keyframes

| Name | Effect | Duration | Easing |
|------|--------|----------|--------|
| `fade-in` | Opacity 0 → 1 | 300ms | ease-out |
| `fade-in-up` | Fade + slide up 20px | 400ms | ease-out |
| `fade-in-down` | Fade + slide down 20px | 400ms | ease-out |
| `slide-in-right` | Slide from right | 300ms | ease-out |
| `scale-in` | Scale 0.95 → 1 | 200ms | ease-out |
| `pulse-slow` | Opacity pulse | 2s | infinite |

### Usage

```jsx
// Tailwind animations
<div className="animate-fade-in-up">Content</div>

// Custom transitions
<div className="transition-smooth hover:scale-105">Button</div>
```

### Timing Functions

- **Default:** `cubic-bezier(0.25, 0.1, 0.25, 1)` — `transition-smooth`
- **Fast:** 150ms for immediate feedback
- **Standard:** 300ms for most transitions
- **Slow:** 400ms for complex transitions

### Guidelines

- Use `animate-fade-in-up` for page/section entrances
- Use `transition-smooth` for hover states
- Use `scale-in` for modals and popovers
- Avoid animations longer than 500ms

---

## Gradients

Warm, subtle gradients for visual interest.

### Utility Classes

**Warm Gradient (Diagonal)**
```css
.bg-gradient-warm
/* linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 100%) */
```

**Warm Gradient (Horizontal)**
```css
.bg-gradient-warm-horizontal
/* linear-gradient(90deg, #EEF2FF 0%, #FAF5FF 100%) */
```

**Indigo Gradient**
```css
.bg-gradient-indigo
/* linear-gradient(135deg, #6366F1 0%, #818CF8 100%) */
```

**Amber Gradient**
```css
.bg-gradient-amber
/* linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%) */
```

### Usage

```jsx
<section className="bg-gradient-warm py-16">
  {/* Hero section with subtle warm background */}
</section>
```

---

## Components

### Buttons

**Primary Button**
```jsx
<button className="bg-primary text-white px-6 py-3 rounded-lg font-medium transition-smooth hover:scale-105 hover:shadow-card">
  Get Started
</button>
```

**Secondary Button**
```jsx
<button className="bg-white text-foreground px-6 py-3 rounded-lg font-medium border border-border transition-smooth hover:shadow-subtle">
  Learn More
</button>
```

**Ghost Button**
```jsx
<button className="text-primary px-6 py-3 rounded-lg font-medium transition-smooth hover:bg-primary/10">
  Skip
</button>
```

### Cards

**Standard Card**
```jsx
<div className="bg-card p-8 rounded-xl shadow-card">
  <h3 className="font-serif text-2xl mb-4">Card Title</h3>
  <p className="text-muted-foreground">Card content...</p>
</div>
```

**Hover Card**
```jsx
<div className="bg-card p-8 rounded-xl shadow-card transition-smooth hover:shadow-large hover:-translate-y-1">
  {/* Interactive card */}
</div>
```

### Inputs

**Text Input**
```jsx
<input
  type="text"
  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
  placeholder="Enter your thoughts..."
/>
```

### Typography Components

**Hero Heading**
```jsx
<h1 className="font-serif text-6xl md:text-7xl font-semibold text-foreground leading-tight">
  Someone who truly listens
</h1>
```

**Section Heading**
```jsx
<h2 className="font-serif text-4xl font-semibold text-foreground mb-6">
  How Confide Works
</h2>
```

**Body Text**
```jsx
<p className="text-lg text-muted-foreground leading-relaxed">
  Share your thoughts in a safe, judgment-free space.
</p>
```

---

## Breakpoints

Mobile-first responsive design.

| Breakpoint | Size | Usage |
|------------|------|-------|
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large desktops |

### Usage

```jsx
<div className="text-4xl md:text-5xl lg:text-6xl">
  {/* Responsive sizing */}
</div>
```

---

## Design Tokens Reference

### Quick Copy-Paste

```jsx
// Headings
className="font-serif text-5xl font-semibold"

// Body text
className="font-sans text-base text-muted-foreground"

// Primary button
className="bg-primary text-white px-6 py-3 rounded-lg font-medium transition-smooth hover:scale-105"

// Card
className="bg-card p-8 rounded-xl shadow-card"

// Section spacing
className="py-16 md:py-24 space-y-12"

// Container
className="max-w-7xl mx-auto px-6"
```

---

## Accessibility

- **Color Contrast:** All text meets WCAG AA standards (4.5:1 minimum)
- **Focus States:** All interactive elements have visible focus rings (`focus:ring-2 focus:ring-primary`)
- **Font Sizes:** Minimum 16px for body text
- **Touch Targets:** Minimum 44×44px for mobile buttons
- **Alt Text:** Always provide for images
- **Keyboard Navigation:** All interactive elements keyboard accessible

---

## Examples

### Hero Section

```jsx
<section className="bg-gradient-warm py-24 md:py-30">
  <div className="max-w-7xl mx-auto px-6">
    <h1 className="font-serif text-6xl md:text-7xl font-semibold text-foreground leading-tight mb-6 animate-fade-in-up">
      Someone who truly listens
    </h1>
    <p className="text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      Share your thoughts in a safe, judgment-free space. Confide is here for you, 24/7.
    </p>
    <button className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth hover:scale-105 hover:shadow-large animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      Start Your Journey
    </button>
  </div>
</section>
```

### Feature Card

```jsx
<div className="bg-card p-10 rounded-xl shadow-card transition-smooth hover:shadow-large hover:-translate-y-1">
  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
    <Icon className="w-6 h-6 text-primary" />
  </div>
  <h3 className="font-serif text-2xl font-semibold mb-4">Always Remembers</h3>
  <p className="text-muted-foreground leading-relaxed">
    Confide remembers every conversation, so you never have to repeat yourself.
  </p>
</div>
```

---

**Confide Design System v1.0** — Last updated: 2026-03-04
