# ROSE Portal - GitHub Pages Deployment Guide

## Overview

The ROSE Portal can be deployed to GitHub Pages for free HTTPS hosting. The portal uses runtime configuration stored in localStorage, so one deployment can serve multiple households.

## Quick Start

### Option 1: Automated Deployment (Recommended)

1. **Configure GitHub Repository**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: **GitHub Actions**

2. **Update Base Path** (if needed):
   - Edit `.github/workflows/deploy.yml`
   - Update the `VITE_BASE_PATH` environment variable:
     - For root domain (`username.github.io`): `VITE_BASE_PATH: /`
     - For subdirectory (`username.github.io/ROSE`): `VITE_BASE_PATH: /ROSE/`

3. **Push to Main Branch**:
   ```bash
   git add .
   git commit -m "feat: add GitHub Pages deployment"
   git push origin main
   ```

4. **Wait for Deployment**:
   - GitHub Actions will automatically build and deploy
   - Check the Actions tab for progress
   - Once complete, visit your GitHub Pages URL

### Option 2: Manual Deployment

1. **Build for Production**:

   For root domain:
   ```bash
   npm run build
   ```

   For subdirectory:
   ```bash
   VITE_BASE_PATH=/ROSE/ npm run build
   ```

2. **Deploy with gh-pages**:
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

3. **Configure GitHub**:
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / `root`

## Configuration Flow

### First-Time Setup

1. **Visit Deployed Portal**: User visits `https://username.github.io` (or subdirectory)
2. **Configuration Modal**: Automatically shows on first visit
3. **Enter URLs**:
   - Backend API URL: `https://your-backend-server.com:8080`
   - Vosk WebSocket URL: `wss://your-backend-server.com:2700`
4. **Save**: Configuration stored in browser's localStorage

### QR Code Installation (Desktop → Phone)

1. **Desktop**: Open Settings → "Install on Phone" section
2. **QR Code**: Shows QR code with embedded configuration
3. **Phone**: Scan QR code → auto-configures → shows PWA install instructions
4. **Install**: Follow platform-specific instructions (iOS/Android)

### Reconfiguration

1. **Settings Page**: Settings → "Backend Configuration" section
2. **Edit**: Click "Edit" buttons to update URLs
3. **Save**: New configuration applied immediately

## Environment Variables

### Build-Time Variables

- `VITE_BASE_PATH`: Base path for deployment (default: `/`)
  - Example: `VITE_BASE_PATH=/ROSE/ npm run build`

### Runtime Configuration (localStorage)

- `rose_backend_url`: Backend API base URL
- `rose_vosk_url`: Vosk WebSocket URL

## GitHub Pages Configuration

### For User/Organization Pages

Repository name: `username.github.io`

**Workflow Configuration**:
```yaml
env:
  VITE_BASE_PATH: /
```

**Access URL**: `https://username.github.io`

### For Project Pages

Repository name: Any (e.g., `ROSE`)

**Workflow Configuration**:
```yaml
env:
  VITE_BASE_PATH: /ROSE/
```

**Access URL**: `https://username.github.io/ROSE/`

## Troubleshooting

### Issue: Blank page after deployment

**Solution**: Check base path configuration
- Ensure `VITE_BASE_PATH` matches your deployment URL
- For subdirectory, path must start and end with `/` (e.g., `/ROSE/`)

### Issue: API calls fail

**Solution**: Configure backend URL
- Open Settings → Backend Configuration
- Enter your backend server URL
- Ensure CORS is enabled on your backend

### Issue: QR code doesn't work

**Solution**: Check URL configuration
- Ensure backend and Vosk URLs are configured
- Visit Settings page on desktop to verify QR code

### Issue: GitHub Actions deployment fails

**Solution**: Check repository settings
- Settings → Pages → Source must be "GitHub Actions"
- Ensure Actions have write permissions
- Check Actions tab for error logs

## Security Considerations

1. **HTTPS**: GitHub Pages provides free HTTPS
2. **Backend CORS**: Ensure your backend allows requests from GitHub Pages domain
3. **No Secrets**: Never commit backend URLs or secrets to git
4. **localStorage**: Configuration stored locally in each browser

## Multiple Households

The same GitHub Pages deployment can serve multiple households:

1. **Household A**: Configures their backend URL in Settings
2. **Household B**: Configures their backend URL in Settings
3. Each household's configuration is stored in their browser's localStorage
4. One deployment, infinite configurations

## PWA Caching

The portal includes PWA caching for offline support:

- **API Cache**: 24-hour expiration, 100 max entries
- **Actuator Cache**: 5-minute expiration, 50 max entries
- **Assets Cache**: 30-day expiration, 200 max entries

Clear cache: Browser DevTools → Application → Clear Storage

## Support

For issues, questions, or contributions:
- GitHub Issues: Create an issue in the repository
- Documentation: Check the main README.md
