# ROSE Portal - Development Guide

## Quick Start

```bash
npm install
npm run dev
```

Visit: `https://localhost:5173`

## Development vs Production

### Development Mode (`npm run dev`)

**Backend API**:
- ✅ Uses **Vite proxy** automatically
- ✅ No configuration modal
- ✅ No mixed content errors
- ✅ Proxies `/api` → Your backend (configured in `.env.local`)
- ✅ Proxies `/actuator` → Your backend (configured in `.env.local`)

**Vosk WebSocket**:
- ✅ Falls back to `ws://raspberrypi.local:2700` if not configured
- ✅ Can be overridden in Settings if needed

**Key Points**:
- Configuration modal **will not appear** in development
- Backend URL from localStorage is **ignored** (proxy is always used)
- HTTPS dev server (https://localhost:5173) proxies to HTTP backend

### Production Mode (`npm run build`)

**Backend API**:
- ⚙️ Reads from localStorage (`rose_backend_url`)
- ⚙️ Shows configuration modal if not set
- ⚙️ User must configure: `https://your-backend.com:8080`

**Vosk WebSocket**:
- ⚙️ Reads from localStorage (`rose_vosk_url`)
- ⚙️ User must configure: `wss://your-backend.com:2700`

## Vite Proxy Configuration

The proxy is configured in `vite.config.ts` to read from environment variables:

```typescript
proxy: {
  '/api': {
    target: process.env.VITE_DEV_BACKEND_HOST,
    changeOrigin: true
  },
  '/actuator': {
    target: process.env.VITE_DEV_BACKEND_HOST,
    changeOrigin: true
  }
}
```

**To configure your backend in development**:
1. Create `.env.local` file in the project root (if not exists)
2. Add your backend URL:
   ```
   VITE_DEV_BACKEND_HOST=http://your-backend-host:8080
   ```
   Example: `VITE_DEV_BACKEND_HOST=http://raspberrypi.local:8080`
3. Restart dev server: `npm run dev`

**Note**: `.env.local` is ignored by git, so your private hostnames stay safe

## Clearing Configuration (If Needed)

If you configured URLs in development and want to reset:

**Browser Console**:
```javascript
localStorage.removeItem('rose_backend_url')
localStorage.removeItem('rose_vosk_url')
location.reload()
```

**Or via Settings Page**:
- Open Settings → Backend Configuration
- Edit each URL
- Save

## Mixed Content Errors

**Problem**: `Blocked loading mixed active content "http://..."`

**Cause**: HTTPS page trying to load HTTP resources

**Solution**: Already handled!
- ✅ Development mode uses Vite proxy
- ✅ Production requires HTTPS backend URLs

## Project Structure

```
portal/
├── .github/workflows/     # GitHub Actions deployment
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ConfigurationModal.vue      # First-run config
│   │   │   └── ConfigurationEditModal.vue  # Settings editor
│   │   └── pwa/
│   ├── composables/
│   │   └── useConfiguration.ts   # Config management
│   ├── config/
│   │   └── api.ts               # API base URL logic
│   ├── services/
│   │   └── apiClient.ts         # Axios client factory
│   ├── stores/
│   │   └── settingsStore.ts     # Pinia store
│   └── views/
│       ├── Install.vue          # QR landing page
│       └── Settings.vue         # Settings page
├── vite.config.ts               # Vite & proxy config
├── DEPLOYMENT.md                # Deployment guide
└── DEVELOPMENT.md               # This file
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with HTTPS

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Type Checking
npm run type-check       # Run TypeScript compiler

# Icons
npm run generate:icons   # Generate PWA icons
```

## HTTPS in Development

The dev server uses HTTPS with self-signed certificates:

**Location**: `.cert/localhost+4.pem` and `.cert/localhost+4-key.pem`

**Browser Warnings**:
- Chrome/Edge: Click "Advanced" → "Proceed to localhost"
- Firefox: Click "Advanced" → "Accept the Risk"
- Safari: May require installing the certificate

**To regenerate certificates** (if needed):
```bash
# Install mkcert (one-time)
brew install mkcert  # macOS
# or download from https://github.com/FiloSottile/mkcert

# Generate certificates
cd portal/.cert
mkcert localhost 127.0.0.1 ::1 dnp6j4rc7q.local
```

## Testing Configuration Flow

### Test First-Run Modal (Production Only)

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Open in browser - modal will appear
```

### Test QR Code Setup

1. **Desktop**: `npm run dev` → Open Settings
2. **Configure URLs**: Add backend/Vosk URLs (optional in dev)
3. **QR Code**: Should show in "Install on Phone" section (desktop only)
4. **Scan**: Use phone to scan QR code
5. **Install Page**: Should auto-configure and show PWA instructions

## Environment Variables

### Development (.env.local)

Used for local development configuration (git-ignored):

```bash
# Required: Backend server URL for Vite proxy
VITE_DEV_BACKEND_HOST=http://your-backend-host:8080

# Optional: Vosk WebSocket URL (if different)
# VITE_DEV_VOSK_HOST=ws://your-backend-host:2700
```

**Important**: This file is git-ignored to protect your private hostnames

### Production (.env.production)

Not used - runtime configuration via localStorage

## Debugging

### Check API Calls

**Browser DevTools → Network Tab**:
- Development: Should see `/api/v1/...` (proxied)
- Production: Should see full URL `https://backend.com:8080/api/v1/...`

### Check Configuration

**Browser Console**:
```javascript
// Check stored URLs
localStorage.getItem('rose_backend_url')
localStorage.getItem('rose_vosk_url')

// Check current mode
import.meta.env.PROD  // false in dev, true in production
```

### Check Proxy

**Vite Dev Server Logs**:
```
[vite] http proxy: /api/v1/plants -> http://your-backend:8080/api/v1/plants
```

The target URL will match your `VITE_DEV_BACKEND_HOST` from `.env.local`

## Common Issues

### Issue: Configuration modal shows in development

**Solution**: This shouldn't happen after the fix. If it does:
```javascript
// Browser console
localStorage.clear()
location.reload()
```

### Issue: API calls fail with CORS error

**Solution**: Backend must allow CORS from `https://localhost:5173`

**Backend Configuration** (Spring Boot example):
```kotlin
@CrossOrigin(origins = ["https://localhost:5173"])
```

### Issue: Vosk WebSocket connection fails

**Solution**:
- Check if Vosk service is running on your backend
- Update URL in Settings if needed

## Hot Module Replacement (HMR)

Vite's HMR is enabled by default:
- ✅ Vue components reload instantly
- ✅ State is preserved during updates
- ✅ No full page refresh needed

**If HMR stops working**:
1. Restart dev server: `Ctrl+C` → `npm run dev`
2. Clear browser cache
3. Check browser console for errors

## TypeScript

**Type Checking**:
```bash
npm run type-check
```

**IDE Setup**:
- VSCode: Install "Vue - Official" extension
- WebStorm: Built-in Vue support

## Contributing

When making changes:

1. **Development**: Test with `npm run dev`
2. **Production Build**: Test with `npm run build && npm run preview`
3. **Type Check**: Run `npm run type-check`
4. **Commit**: Use conventional commits (e.g., `feat:`, `fix:`, `chore:`)

## Support

For issues or questions:
- Check `DEPLOYMENT.md` for production deployment
- Check `DEVELOPMENT.md` (this file) for development setup
- Create an issue on GitHub
