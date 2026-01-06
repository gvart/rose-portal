# ROSE Portal - Development Guide

## Quick Start

```bash
npm install
npm run dev
```

Visit: `http://localhost:5173`

## Development vs Production

### Development Mode (`npm run dev`)

**Backend API & Vosk WebSocket**:
- ✅ Uses **localStorage configuration** (same as production)
- ✅ Configuration modal **will appear** on first visit
- ✅ Configure your backend URL in Settings or via the modal

**Key Points**:
- Development and production work **exactly the same**
- Configure backend URL: `http://your-backend.com:8080`
- Configure Vosk URL: `ws://your-backend.com:2700`
- No proxy, no environment variables - pure runtime configuration

### Production Mode (`npm run build`)

**Backend API & Vosk WebSocket**:
- ⚙️ Uses **localStorage configuration** (same as development)
- ⚙️ Configuration modal appears on first visit
- ⚙️ Configure via Settings page anytime

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

## Configuration

Both development and production use runtime configuration stored in localStorage. No environment variables needed!

**How it works**:
1. On first visit, a configuration modal appears
2. Enter your backend URL (e.g., `http://192.168.1.100:8080`)
3. Enter your Vosk WebSocket URL (e.g., `ws://192.168.1.100:2700`)
4. Configuration is saved in browser's localStorage
5. Change configuration anytime via Settings → Backend Configuration

## Debugging

### Check API Calls

**Browser DevTools → Network Tab**:
- Should see full URL (e.g., `http://backend.com:8080/api/v1/...`)
- Works the same in development and production

### Check Configuration

**Browser Console**:
```javascript
// Check stored URLs
localStorage.getItem('rose_backend_url')
localStorage.getItem('rose_vosk_url')

// Check current mode
import.meta.env.PROD  // false in dev, true in production
```

## Common Issues

### Issue: Configuration modal appears on every reload

**Solution**: Configuration should persist in localStorage. If it doesn't:
```javascript
// Browser console - check if config is saved
localStorage.getItem('rose_backend_url')
localStorage.getItem('rose_vosk_url')
```

If values are null, reconfigure via the modal or Settings page.

### Issue: API calls fail with CORS error

**Solution**: Backend must allow CORS from `http://localhost:5173`

**Backend Configuration** (Spring Boot example):
```kotlin
@CrossOrigin(origins = ["http://localhost:5173"])
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
