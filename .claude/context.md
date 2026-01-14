# Rose Portal - Project Context

## Project Overview

**Rose Portal** is a Progressive Web App (PWA) built with Vue 3, TypeScript, and Tailwind CSS. It serves as a unified dashboard hosting multiple mini-applications, designed specifically for touchscreen devices (tablets, smartphones) with a focus on precision, density, and technical aesthetics.

**Tech Stack:**
- Vue 3.5+ (Composition API)
- TypeScript
- Vue Router 4
- Pinia (State Management)
- Tailwind CSS
- Vite
- PWA (with Workbox)

**Target Platform:** Touchscreen devices (tablets/phones), optimized for iOS/Android browsers

---

## Design Philosophy

### Design Direction: Precision & Density

The entire UI follows a **technical, information-forward aesthetic** inspired by Linear, Raycast, and terminal interfaces:

- **Borders-only depth strategy** - Minimal shadows, rely on subtle borders for separation
- **Sharp corners** - 4-12px border radius (avoid rounded/pill shapes unless intentional)
- **Cool slate foundations** - Professional, trustworthy color palette
- **4px baseline grid** - All spacing adheres to 4px increments
- **Monochrome base** - Color used only for semantic meaning (status, actions, errors)
- **Pure touchscreen interaction** - `:active` states instead of `:hover`

### Key Design Principles

1. **Symmetrical Padding**: TLBR must match. If top is 16px, all sides should be 16px (exception: horizontal padding when content needs breathing room)

2. **4px Grid System**:
   - 4px (micro spacing)
   - 8px (tight spacing)
   - 12px (standard gaps)
   - 16px (comfortable padding)
   - 24px (section spacing)
   - 32px (major sections)

3. **Border Radius Consistency**:
   - `--radius-xs`: 4px (badges)
   - `--radius-sm`: 6px (chips, small cards, inputs)
   - `--radius-md`: 8px (default cards)
   - `--radius-lg`: 12px (large panels)
   - **NEVER** use `--radius-full` (50%) for rectangular elements like chips - only for circular icons/avatars

4. **Depth System** (Borders-Only):
   - Level 0: Flush with background
   - Level 1: `1px solid var(--color-border-primary)` - Default cards
   - Level 2: `1px solid var(--color-border-secondary)` - Emphasized borders
   - Level 3/4: Modals/floating elements (subtle shadow for separation)

5. **Typography**:
   - System fonts: `-apple-system, BlinkMacSystemFont, "SF Pro Display"`
   - Monospace for data: IDs, numbers, timestamps
   - Font sizes: 11px, 12px, 13px, **14px (base)**, 16px, 18px, 24px, 32px
   - Headlines: 600 weight, tight letter-spacing (-0.02em)
   - Body: 400-500 weight
   - Labels: 500 weight

6. **Color Strategy**:
   - Gray builds structure
   - Color only for meaning: status (success/warning/error), actions, semantic indicators
   - Avoid decorative color

7. **Touch Interactions**:
   - Minimum touch target: 44px (var(--space-11))
   - Use `:active` states for touch feedback (scale, background change)
   - Never rely on `:hover` - this is a touchscreen-first app

8. **Animation**:
   - 150ms for micro-interactions
   - 200-250ms for larger transitions
   - Easing: `cubic-bezier(0.25, 1, 0.5, 1)`
   - NO spring/bouncy effects

9. **Circular Progress Indicators**:
   - NEVER use `stroke-linecap="round"` on circular progress rings
   - Keep edges sharp and clean

---

## Project Structure

```
rose-portal/
├── src/
│   ├── apps/                      # Mini-applications (self-contained)
│   │   ├── calendar/
│   │   │   ├── components/        # App-specific components
│   │   │   ├── composables/       # App-specific composables (if any)
│   │   │   ├── services/          # App-specific API services
│   │   │   ├── stores/            # App-specific Pinia stores
│   │   │   ├── types/             # App-specific TypeScript types
│   │   │   ├── utils/             # App-specific utilities
│   │   │   └── CalendarApp.vue    # Main app entry point
│   │   ├── plant-monitor/
│   │   ├── recipe/
│   │   │   └── meal-prep/         # Sub-app within recipe
│   │   ├── system-monitor/
│   │   ├── timer/
│   │   └── weather/
│   │
│   ├── components/                # Shared/global components
│   │   ├── common/                # Reusable UI components
│   │   │   ├── AppIcon.vue
│   │   │   ├── BackButton.vue
│   │   │   ├── ConfigurationModal.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── PullIndicator.vue
│   │   │   └── SwipeIndicator.vue
│   │   ├── feedback/              # User feedback components
│   │   │   ├── EmptyState.vue
│   │   │   └── LoadingSkeleton.vue
│   │   ├── navigation/
│   │   │   └── FloatingNavBar.vue
│   │   ├── pwa/
│   │   │   ├── InstallPrompt.vue
│   │   │   └── UpdatePrompt.vue
│   │   ├── timer/                 # Global timer components
│   │   │   ├── TimerFloatingPill.vue
│   │   │   └── TimerCompletionModal.vue
│   │   └── icons/                 # SVG icon components
│   │
│   ├── composables/               # Shared Vue composables
│   │   ├── useClock.ts
│   │   ├── useConfiguration.ts
│   │   ├── useDarkMode.ts
│   │   ├── useDeviceDetection.ts
│   │   ├── useGeolocation.ts
│   │   ├── useHapticFeedback.ts
│   │   ├── useOrientation.ts
│   │   ├── usePullToRefresh.ts
│   │   ├── usePushNotifications.ts
│   │   ├── usePWA.ts
│   │   ├── useSwipeGesture.ts
│   │   └── useVoskSpeechRecognition.ts
│   │
│   ├── directives/                # Custom Vue directives
│   │   ├── haptic.ts              # v-haptic for touch feedback
│   │   └── swipeBack.ts
│   │
│   ├── layouts/                   # Layout components
│   │   ├── AppLayout.vue          # Layout for mini-apps (with header)
│   │   └── HomeLayout.vue         # Layout for home screen
│   │
│   ├── views/                     # Route-level views
│   │   ├── Home.vue
│   │   ├── Settings.vue
│   │   └── Install.vue
│   │
│   ├── stores/                    # Global Pinia stores
│   │   ├── appRegistry.ts
│   │   └── settingsStore.ts
│   │
│   ├── config/                    # Configuration files
│   │   ├── api.ts
│   │   └── apps.ts                # App registry configuration
│   │
│   ├── types/                     # Global TypeScript types
│   │   └── app.ts
│   │
│   ├── assets/
│   │   └── styles/
│   │       ├── tokens.css         # Design system tokens
│   │       └── main.css           # Global styles
│   │
│   ├── App.vue                    # Root component
│   └── main.ts                    # Application entry point
│
├── public/
│   └── icons/                     # App icons, PWA icons
│
├── tailwind.config.js             # Tailwind configuration (extends tokens)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Mini-App Architecture

Each mini-app in `src/apps/` is **self-contained** and follows this structure:

```
src/apps/{app-name}/
├── components/           # App-specific components
├── composables/          # App-specific composables (optional)
├── services/             # API services (optional)
├── stores/               # Pinia stores (optional)
├── types/                # TypeScript types (optional)
├── utils/                # Utility functions (optional)
└── {AppName}App.vue      # Main entry point
```

**Registration:**
Apps are registered in `src/config/apps.ts` with:
- `id`, `name`, `icon`, `description`
- `route` (Vue Router path)
- `component` (lazy-loaded)
- `color` (theme color)
- `enabled`, `order`

**Routing:**
Each app has its own route defined in Vue Router. The main app component is lazy-loaded via dynamic imports.

---

## Component Organization

### Shared Components (`src/components/`)

- **common/**: Reusable UI building blocks (buttons, inputs, modals, indicators)
- **feedback/**: User feedback UI (loading states, empty states, errors)
- **navigation/**: Navigation components (nav bars, tabs)
- **pwa/**: PWA-specific UI (install prompts, update notifications)
- **timer/**: Global timer UI (floating pills, modals)
- **icons/**: SVG icon components

### App-Specific Components (`src/apps/{app}/components/`)

Components used exclusively within a single mini-app. Keep them scoped to avoid polluting the global namespace.

---

## Composables

### Global Composables (`src/composables/`)

Reusable Vue 3 Composition API logic:

- **useDarkMode**: Dark/light mode toggle with system preference detection
- **useHapticFeedback**: Haptic feedback for touch interactions
- **usePullToRefresh**: Pull-to-refresh gesture handling
- **useSwipeGesture**: Swipe gesture detection (e.g., swipe-back)
- **usePWA**: PWA installation and update management
- **useGeolocation**: Geolocation API wrapper
- **useOrientation**: Device orientation detection
- **useClock**: Real-time clock state
- **useConfiguration**: App configuration management
- **useDeviceDetection**: Device type/capabilities detection
- **usePushNotifications**: Push notification management
- **useVoskSpeechRecognition**: Offline speech recognition (Vosk)

### App-Specific Composables

Located in `src/apps/{app}/composables/` when logic is specific to one app.

---

## Design Tokens

**Location:** `src/assets/styles/tokens.css`

All design values are defined as CSS custom properties (variables). **Always use tokens, never hardcode values.**

### Spacing (4px Grid)

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-7: 28px
--space-8: 32px
--space-9: 36px
--space-10: 40px
--space-11: 44px (touch target)
--space-12: 48px
```

### Colors

**Backgrounds:**
- `--color-bg-primary`: #FFFFFF (light) / #0F172A (dark)
- `--color-bg-secondary`: #F8FAFC (light) / #1E293B (dark)
- `--color-bg-tertiary`: #F1F5F9 (light) / #334155 (dark)
- `--color-bg-active`: #CBD5E1 (light) / #64748B (dark) - Touch `:active` state

**Borders:**
- `--color-border-primary`: #E2E8F0 (light) / rgba(255,255,255,0.10) (dark)
- `--color-border-secondary`: #CBD5E1 (light) / rgba(255,255,255,0.15) (dark)

**Text (4-level hierarchy):**
- `--color-text-primary`: #0F172A (light) / #F1F5F9 (dark)
- `--color-text-secondary`: #475569 (light) / #CBD5E1 (dark)
- `--color-text-muted`: #64748B (light) / #94A3B8 (dark)
- `--color-text-faint`: #94A3B8 (light) / #64748B (dark)

**Semantic Colors:**
- `--color-success-solid`: #22C55E
- `--color-warning-solid`: #F59E0B
- `--color-error-solid`: #EF4444
- `--color-info-solid`: #3B82F6
- `--color-accent-primary`: #3B82F6 (light) / #60A5FA (dark)

### Border Radius

```css
--radius-xs: 4px
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-full: 50% (only for circular elements)
```

### Depth (Borders-Only)

```css
--depth-1-border: 1px solid var(--color-border-primary)
--depth-2-border: 1px solid var(--color-border-secondary)
--depth-3-shadow: 0 8px 16px rgba(0,0,0,0.12) (light) / rgba(0,0,0,0.4) (dark)
--depth-4-shadow: 0 4px 12px rgba(0,0,0,0.08) (light) / rgba(0,0,0,0.3) (dark)
```

### Typography

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif
--font-mono: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace

--font-size-11: 11px
--font-size-12: 12px
--font-size-13: 13px
--font-size-14: 14px (base)
--font-size-16: 16px
--font-size-18: 18px
--font-size-24: 24px
--font-size-32: 32px

--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700

--letter-spacing-tight: -0.02em (headlines)
--letter-spacing-normal: 0
--letter-spacing-wide: 0.02em (labels)
```

### Animation

```css
--duration-fast: 150ms
--duration-normal: 200ms
--duration-slow: 250ms

--ease-in-out: cubic-bezier(0.25, 1, 0.5, 1)
```

---

## Tailwind Integration

Tailwind is configured to extend the design tokens. **Prefer using Tailwind utilities** when available, but always reference tokens for consistency.

**Example:**
```vue
<div class="p-4 bg-bg-primary border border-border-primary rounded-md">
  <!-- padding: var(--space-4) -->
  <!-- background: var(--color-bg-primary) -->
  <!-- border-radius: var(--radius-md) -->
</div>
```

---

## Coding Conventions

### Vue 3 Composition API

**Always use:**
- `<script setup lang="ts">` syntax
- TypeScript for type safety
- Composition API (no Options API)

**Component Structure:**
```vue
<template>
  <!-- Template -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
const props = defineProps<{
  title: string
  count: number
}>()

// Emits
const emit = defineEmits<{
  click: [id: string]
  update: [value: number]
}>()

// Reactive state
const isOpen = ref(false)

// Computed
const displayText = computed(() => `${props.title}: ${props.count}`)
</script>

<style scoped>
/* Scoped styles using design tokens */
.component {
  padding: var(--space-4);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
}
</style>
```

### TypeScript

- Define types in dedicated `types/` directories (global or app-specific)
- Use interfaces for object shapes
- Use type aliases for unions, primitives
- Export all shared types

### Naming Conventions

- **Components**: PascalCase (`AppIcon.vue`, `LoadingSpinner.vue`)
- **Composables**: camelCase with `use` prefix (`useDarkMode.ts`)
- **Stores**: camelCase with `Store` suffix (`settingsStore.ts`)
- **Types**: PascalCase interfaces/types (`AppConfig`, `WeatherData`)
- **CSS Classes**: kebab-case (`.suggestion-chip`, `.app-header`)
- **CSS Variables**: kebab-case with `--` prefix (`--color-bg-primary`)

### File Organization

- One component per file
- Component name matches filename
- Keep components small and focused
- Extract complex logic into composables
- Co-locate related files (types, services, stores) within app directories

---

## State Management

**Pinia** is used for global state management.

### Global Stores (`src/stores/`)

- `appRegistry.ts`: App registration and configuration
- `settingsStore.ts`: User settings and preferences

### App-Specific Stores (`src/apps/{app}/stores/`)

Each mini-app can have its own Pinia store(s) for app-specific state.

**Example:**
```typescript
// src/apps/weather/stores/weatherStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWeatherStore = defineStore('weather', () => {
  const location = ref<string>('New York')
  const forecast = ref<WeatherData[]>([])

  async function fetchWeather() {
    // ...
  }

  return { location, forecast, fetchWeather }
})
```

---

## Routing

Vue Router 4 is used for navigation.

**Route Structure:**
- `/` - Home screen (app grid)
- `/settings` - Settings page
- `/{app-route}` - Mini-app routes (e.g., `/weather`, `/recipe`)

**Lazy Loading:**
All mini-app components are lazy-loaded via dynamic imports in `src/config/apps.ts`.

**Navigation:**
- `<router-link>` for declarative navigation
- `useRouter()` for programmatic navigation
- Back button uses `router.back()` or `router.push('/')` as fallback

---

## Touch Interactions

### Haptic Feedback

Use the `v-haptic` directive for touch feedback:

```vue
<button v-haptic @click="handleClick">Click Me</button>
```

This triggers haptic feedback on supported devices.

### Touch States

**NEVER use `:hover` states** - this is a touchscreen-first app.

Use `:active` for touch feedback:

```css
.button {
  background: var(--color-bg-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.button:active {
  transform: scale(0.96);
  background: var(--color-bg-active);
}
```

### Minimum Touch Target

All interactive elements must have a minimum size of **44px** (`var(--space-11)`).

```css
.chip {
  min-height: var(--space-11);
  min-width: var(--space-11);
}
```

---

## PWA Features

The app is a fully installable PWA with:
- Service worker (Workbox)
- Offline support
- Install prompt (`components/pwa/InstallPrompt.vue`)
- Update notifications (`components/pwa/UpdatePrompt.vue`)
- Push notifications (via `usePushNotifications`)

**Safe Area Insets:**
Account for notches/status bars using CSS variables:

```css
--safe-top: env(safe-area-inset-top)
--safe-bottom: env(safe-area-inset-bottom)
--safe-left: env(safe-area-inset-left)
--safe-right: env(safe-area-inset-right)
```

---

## Gestures

### Swipe-Back Gesture

The `useSwipeGesture` composable enables swipe-back navigation (swipe from left edge to go back).

**Used in:** `AppLayout.vue`

### Pull-to-Refresh

The `usePullToRefresh` composable enables pull-to-refresh on scrollable content.

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { usePullToRefresh } from '@/composables/usePullToRefresh'

const contentRef = ref<HTMLElement | null>(null)

async function handleRefresh() {
  // Refresh logic
  await fetchData()
}

const { state, distance, progress } = usePullToRefresh(contentRef, {
  onRefresh: handleRefresh,
  threshold: 80
})
</script>

<template>
  <div ref="contentRef" class="scrollable-content">
    <PullIndicator :state="state" :distance="distance" :progress="progress" />
    <!-- Content -->
  </div>
</template>
```

---

## Dark Mode

Dark mode is managed via the `useDarkMode` composable.

**Features:**
- Manual toggle (light/dark/auto)
- Automatic system preference detection
- Persisted to localStorage
- Applies `data-theme="dark"` attribute to `<html>`

**Token Overrides:**
Dark mode tokens are defined in `src/assets/styles/tokens.css` under:
- `:root[data-theme="dark"]` (manual override)
- `@media (prefers-color-scheme: dark)` (automatic)

---

## API Integration

### Service Layer

API calls are abstracted into service files (usually in `src/apps/{app}/services/`).

**Example:**
```typescript
// src/apps/weather/services/weatherApi.ts
import axios from 'axios'
import type { WeatherData } from '../types/weather'

export async function fetchForecast(location: string): Promise<WeatherData> {
  const response = await axios.get(`/api/weather?location=${location}`)
  return response.data
}
```

### Configuration

API base URLs and configuration are centralized in `src/config/api.ts`.

---

## Common Patterns

### Loading States

Use `LoadingSpinner` or `LoadingSkeleton` for async operations:

```vue
<template>
  <div v-if="isLoading">
    <LoadingSpinner />
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### Empty States

Use `EmptyState` component for empty data:

```vue
<EmptyState
  icon="inbox"
  title="No events"
  description="You don't have any upcoming events"
/>
```

### Error Handling

Use `ErrorMessage` component for errors:

```vue
<ErrorMessage
  v-if="error"
  :message="error.message"
  @retry="fetchData"
/>
```

### Modal Dialogs

Common pattern for modals:

```vue
<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <!-- Modal content -->
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 90%;
  box-shadow: var(--depth-3-shadow);
}
</style>
```

---

## Performance Considerations

1. **Lazy Loading**: All mini-apps are lazy-loaded to reduce initial bundle size
2. **Code Splitting**: Each app is a separate chunk
3. **Image Optimization**: Use responsive images and lazy loading
4. **Virtual Scrolling**: For long lists, consider virtual scrolling
5. **Debounce/Throttle**: Use for frequent events (scroll, input)

---

## Testing & Development

**Dev Server:**
```bash
npm run dev
# Runs on http://0.0.0.0:5173 (accessible from local network)
```

**Build:**
```bash
npm run build
```

**Type Checking:**
```bash
npm run type-check
```

**Icon Generation:**
```bash
npm run generate:icons
```

---

## Common Issues & Solutions

### Issue: Chips have rounded pill shape
**Solution:** Use `--radius-sm` (6px), not `--radius-full` (50%) for rectangular chips.

### Issue: Circular progress has rounded edges
**Solution:** Remove `stroke-linecap="round"` from SVG `<circle>` elements.

### Issue: No spacing between header and content
**Solution:** Ensure proper `padding-top` calculation in `AppLayout.vue`:
```css
padding-top: calc(68px + var(--space-6));
```

### Issue: Touch targets too small
**Solution:** Ensure `min-height: var(--space-11)` (44px) for all interactive elements.

### Issue: Inconsistent spacing
**Solution:** Always use design tokens (`var(--space-*)`) on the 4px grid. Never hardcode pixel values.

### Issue: Dark mode borders invisible
**Solution:** Dark mode borders use low-opacity white. This is intentional - resist increasing opacity. The subtlety is part of the design.

---

## Key Takeaways

1. **Always use design tokens** - Never hardcode colors, spacing, or typography
2. **4px grid system** - All spacing must be on the 4px grid
3. **Sharp corners** - Use 4-12px border radius, avoid pills except for truly circular elements
4. **Borders over shadows** - Prefer subtle borders for depth
5. **Touchscreen-first** - Use `:active` states, never `:hover`
6. **44px minimum** - All touch targets must be at least 44px
7. **Color for meaning** - Only use color for semantic purposes (status, actions)
8. **Monospace for data** - Use `--font-mono` for IDs, numbers, timestamps
9. **Self-contained apps** - Each mini-app is independent with its own components/stores/types
10. **TypeScript everywhere** - Use TypeScript for type safety and better DX

---

## Touch-Based Drag & Drop (Chores App)

The chores app uses **vue.draggable.next** (vuedraggable) for touch-friendly drag and drop on mobile devices.

### Libraries

- **vuedraggable@next** (vue.draggable.next): Vue 3 wrapper for SortableJS
- **sortablejs**: Core drag & drop library with excellent mobile support

### Key Features

1. **Long-press to drag**: 300ms delay on mobile to initiate drag
2. **Visual feedback**:
   - Chosen state: Scale 1.02, accent border, shadow
   - Dragging: Scale 1.05, rotate 2deg, elevated shadow
   - Ghost placeholder: Opacity 0.4, dashed border
3. **Haptic feedback**: Vibration on drag start/end (uses `useHapticFeedback`)
4. **Edge scrolling**: Auto-scroll when dragging near screen edges
5. **Optimistic updates**: UI updates immediately, rollback on API error

### Implementation Pattern

```vue
<draggable
  v-model="items"
  item-key="id"
  group="items"
  :animation="200"
  :delay="300"
  :delay-on-touch-only="true"
  :force-fallback="true"
  ghost-class="item-ghost"
  drag-class="item-dragging"
  chosen-class="item-chosen"
  @start="handleDragStart"
  @end="handleDragEnd"
  @change="handleChange"
>
  <template #item="{ element }">
    <ItemCard :item="element" />
  </template>
</draggable>
```

---

## Mobile Swipe Gestures (Chores App)

### useSwipeActions Composable

Location: `src/apps/chores/composables/useSwipeActions.ts`

Reusable composable for detecting swipe gestures with haptic feedback.

**Features**:
- Touch event handling (touchstart, touchmove, touchend)
- Swipe direction detection (left/right)
- Configurable thresholds (default: 80px right, 120px left)
- Velocity detection for fling gestures
- Haptic feedback on threshold cross
- Vertical vs horizontal scroll detection
- Elastic resistance beyond threshold

**Usage**:
```ts
const { swipeOffset, direction, handleTouchStart, handleTouchMove, handleTouchEnd } =
  useSwipeActions(containerRef, {
    thresholdRight: 80,
    thresholdLeft: 120,
    onSwipeRight: () => console.log('Swiped right'),
    onSwipeLeft: () => console.log('Swiped left'),
    hapticEnabled: true
  })
```

**Swipe Actions in Chores**:
- **Right swipe (80px)**: Quick-move card to next column (TODO → IN_PROGRESS → DONE)
- **Left swipe (120px)**: Reveal action buttons (Edit, Assign, Delete)

---

## Horizontal Column Navigation (Chores App)

On mobile (< 768px), the kanban board uses horizontal scroll with scroll-snap for column navigation.

**Features**:
- Full-width columns (100vw each)
- CSS scroll-snap for smooth column-by-column scrolling
- Column indicator dots (fixed bottom, centered)
- Tap dots to jump to specific column
- Active dot highlighted (scale 1.2x, full opacity)
- Hidden scrollbar for cleaner UI

**CSS Pattern**:
```css
@media (max-width: 768px) {
  .kanban-board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .kanban-column {
    flex: 0 0 100vw;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
}
```

---

## Rich Text Editor (Chores App)

The chores app uses **TipTap** for WYSIWYG editing of chore descriptions with markdown output.

### Components

- **ChoreDescriptionEditor**: WYSIWYG editor with minimal toolbar
  - Location: `src/apps/chores/components/ChoreDescriptionEditor.vue`
  - Extensions: StarterKit, Link, Placeholder
  - Toolbar: Bold, Italic, Link, Bullet List, Ordered List
  - Outputs markdown for storage
  - Touch-optimized buttons (min 44px)

- **MarkdownRenderer**: Safe markdown viewer with clickable links
  - Location: `src/apps/chores/components/MarkdownRenderer.vue`
  - Uses markdown-it (already installed)
  - Line clamping support (1-5 lines)
  - Links open in new tab with `target="_blank"` and `rel="noopener noreferrer"`
  - Prevents event propagation on link clicks

### Reusable Infrastructure

- **useTipTapEditor**: Located in notes app (`src/apps/notes/composables/useTipTapEditor.ts`)
- **markdownConverter**: Markdown ↔ TipTap JSON conversion (`src/apps/notes/utils/markdownConverter.ts`)

---

## Floating Action Button (FAB) Pattern

Mobile apps use FABs instead of header buttons for primary actions.

**Design Specs**:
- Size: 56px × 56px (circular)
- Position: Fixed bottom-right with safe area insets
- Bottom: `calc(var(--safe-bottom) + var(--space-4))`
- Right: `var(--space-4)`
- Z-index: 40 (below modals, above content)
- Shadow: `box-shadow: 0 4px 12px rgba(0,0,0,0.15)`
- Color: Primary action color (#EC4899 for chores)
- Active state: Scale 0.95
- Desktop: Hidden (header button used instead)

**Usage**: Add `v-haptic` directive for touch feedback

---

## Resources

- **Design Tokens**: `src/assets/styles/tokens.css`
- **Tailwind Config**: `tailwind.config.js`
- **App Registry**: `src/config/apps.ts`
- **Global Composables**: `src/composables/`
- **Shared Components**: `src/components/`

---

**Last Updated:** 2026-01-14
