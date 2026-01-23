# Teardown Generator Design System

Created: 2026-01-22
Mode: Showcase (landing) + Interface (analysis)

---

## Brand Identity

**Product**: SaaS competitive intelligence tool
**Positioning**: Fast, technical, bold - "X-ray vision for SaaS"
**Personality**: Confident, precise, builder-focused

---

## Color Palette: Electric Orange on Dark

Dark-mode-first palette with high-contrast orange accent.

### Core Colors
```css
/* Backgrounds */
--background: #09090B;        /* zinc-950 - page bg */
--background-elevated: #18181B; /* zinc-900 - cards */
--background-muted: #27272A;  /* zinc-800 - subtle sections */

/* Foreground */
--foreground: #FAFAFA;        /* zinc-50 - primary text */
--foreground-muted: #A1A1AA;  /* zinc-400 - secondary text */
--foreground-subtle: #71717A; /* zinc-500 - tertiary */

/* Brand */
--primary: #F97316;           /* orange-500 - primary actions */
--primary-hover: #EA580C;     /* orange-600 - hover state */
--primary-foreground: #FFFFFF;

/* Accent (data visualization, secondary actions) */
--accent: #22D3EE;            /* cyan-400 */
--accent-muted: #0891B2;      /* cyan-600 */

/* Borders */
--border: rgba(255, 255, 255, 0.1);
--border-muted: rgba(255, 255, 255, 0.05);

/* Semantic */
--success: #22C55E;           /* green-500 */
--warning: #F59E0B;           /* amber-500 */
--error: #EF4444;             /* red-500 */
--info: #3B82F6;              /* blue-500 */
```

### Light Mode Override
For users who prefer light mode:
```css
/* Light mode uses inverted values */
--background: #FAFAFA;
--background-elevated: #FFFFFF;
--foreground: #09090B;
--foreground-muted: #52525B;
--primary: #EA580C;           /* orange-600 for better contrast */
```

---

## Typography

### Typeface
- **Primary**: Geist Sans (already configured)
- **Monospace**: Geist Mono (for technical data)

### Scale
```css
--text-xs: 11px;     /* micro labels */
--text-sm: 12px;     /* badges, hints */
--text-base: 14px;   /* body */
--text-lg: 16px;     /* emphasized body */
--text-xl: 18px;     /* card titles */
--text-2xl: 24px;    /* section headers */
--text-3xl: 32px;    /* page titles */
--text-4xl: 48px;    /* hero headline */
--text-5xl: 64px;    /* impact text */
```

### Weights
- 400: Body text
- 500: Labels, buttons
- 600: Subheadings
- 700: Headlines

---

## Layout Fundamentals

### Container Configuration (REQUIRED)
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;    /* 24px mobile */
  padding-right: 1.5rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-left: 2rem;    /* 32px tablet */
    padding-right: 2rem;
  }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
    padding-left: 4rem;    /* 64px desktop */
    padding-right: 4rem;
  }
}
```

### Horizontal Padding Standards
| Viewport | Minimum Side Padding |
|----------|---------------------|
| Mobile (<640px) | 24px |
| Tablet (640-1023px) | 32px |
| Desktop (1024px+) | 64px |

### Section Spacing
```css
--section-gap-sm: 48px;   /* py-12 */
--section-gap-md: 64px;   /* py-16 */
--section-gap-lg: 96px;   /* py-24 */
```

### Content Width Constraints
```css
--prose-max-width: 65ch;     /* Body text */
--form-max-width: 640px;     /* Forms */
--content-max-width: 1024px; /* Main content */
--page-max-width: 1280px;    /* Full sections */
```

---

## Spacing

4px base grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

---

## Depth Strategy: Shadows

Elevated surfaces with subtle shadows on dark background.

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4);
```

Cards use `--background-elevated` with subtle border:
```css
.card {
  background: var(--background-elevated);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}
```

---

## Signature Elements

### 1. Scan Line Animation
Subtle gradient line that sweeps across cards during analysis.
```css
.scan-line {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--primary) 50%,
    transparent 100%
  );
  height: 1px;
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}
```

### 2. Tech Badges
Orange/cyan color coding with confidence indicators.
- High confidence: solid background
- Medium: outlined
- Low: dashed border

### 3. Score Gauge
Circular progress with orange fill, cyan accent for data points.

### 4. Analysis Steps
Step-by-step progress with orange checkmarks on completion.

---

## Component Patterns

### Buttons
```css
/* Primary */
.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

/* Secondary */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--foreground);
}
```

### Cards
```css
.card {
  background: var(--background-elevated);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.card-highlighted {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}
```

### Inputs
```css
.input {
  background: var(--background);
  border: 1px solid var(--border);
  height: 44px;
  padding: 0 16px;
  border-radius: 8px;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}
```

---

## Anti-Patterns (Do Not Use)

- Purple gradients
- Generic SaaS blue (#3B82F6) as primary
- "Get Started" without context
- Stock photography
- Gradient text
- Excessive rounded corners (max 12px for cards)

---

## CTA Copy Guidelines

| Instead of | Use |
|------------|-----|
| Get Started | Analyze a site |
| Learn More | See how it works |
| Sign Up | Create free account |
| Try Free | Start analyzing |

---

## Changelog

### 2026-01-22 (Update 2)
- Added Layout Fundamentals section
- Defined container configuration (max-width, horizontal padding)
- Added horizontal padding standards by viewport
- Added section spacing and content width constraints
- Fixed content alignment (was flush against left edge)

### 2026-01-22
- Initial system creation
- Chose Electric Orange on Dark palette
- Defined signature elements
- Set up component patterns
