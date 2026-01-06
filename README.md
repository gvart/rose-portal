# ROSE Portal - Smart Hub

A Vue 3-based smart hub interface for Raspberry Pi 5, optimized for 8-inch horizontal displays.

## Features

- Modular app architecture
- Touch-optimized UI (44px minimum tap targets)
- Recipe Finder with AI integration
- Easy to extend with new apps

## Development

### Prerequisites

- Node.js 18+
- Running Spring Boot backend on port 8080

### Setup

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Access at: http://localhost:5173

### Build for Production

```bash
npm run build
```

## Adding New Apps

1. Create app folder in `src/apps/[name]/`
2. Add to `src/config/apps.ts` registry
3. Done! Router and home screen auto-update

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- Vue Router
- Pinia (state management)
- TailwindCSS
- Axios
- Vite (build tool)
