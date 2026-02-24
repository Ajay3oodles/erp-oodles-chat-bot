# Oodles Chat Bot Frontend - Deployment Guide

## 📁 Project Structure

```
oodles-chat-bot-frontend/
├── admin/                      # Admin Dashboard
│   ├── src/
│   ├── vite.config.js
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   └── dist/ (after build)
│
├── widget/                     # Embeddable Chat Widget
│   ├── src/
│   ├── vite.config.js
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   └── dist/ (after build)
│
└── package.json (root - optional for monorepo)
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
cd oodles-chat-bot-frontend

# Install widget
cd widget && npm install

# Install admin
cd ../admin && npm install
```

### 2. Run Development Servers (3 Terminals)

**Terminal 1: Widget Dev Server**
```bash
cd oodles-chat-bot-frontend/widget
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2: Admin Dev Server**
```bash
cd oodles-chat-bot-frontend/admin
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3: Backend API** (if running locally)
```bash
# Your backend should run on http://localhost:8001
```

Visit **http://localhost:3000** → Widget appears as floating button ✅

---

## 🔧 Environment Configuration

### Widget `.env` Files

**widget/.env.development**
```env
VITE_API_BASE=http://localhost:8001
```

**widget/.env.production**
```env
VITE_API_BASE=https://api.oodleserp.com
```

### Admin `.env` Files

**admin/.env.development**
```env
VITE_API_BASE=http://localhost:8001
```

**admin/.env.production**
```env
VITE_API_BASE=https://api.oodleserp.com
```

> Change `8001` to your actual backend port and `api.oodleserp.com` to your production API URL.

---

## 🔨 Vite Configuration

### Widget Config (UMD Build for Embedding)

```javascript
// widget/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'OodlesWidget',
      fileName: () => 'oodles-widget.js',
      formats: ['umd'],  // Important for standalone embedding
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    minify: 'terser',
  },
});
```

### Admin Config (Standard Build)

```javascript
// admin/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

---

## 🏗️ Two Deployment Methods

### Method 1: Standalone Widget (Recommended for Multiple Apps)

Widget is served independently, can be embedded in any application.

#### Build

```bash
cd oodles-chat-bot-frontend

# Build widget
cd widget && npm run build
# Output: widget/dist/oodles-widget.js (~100-150KB)

# Build admin (doesn't include widget)
cd ../admin && npm run build
# Output: admin/dist/
```

#### Deploy Widget

```bash
# Option A: AWS S3 + CloudFront
aws s3 cp widget/dist/oodles-widget.js s3://your-bucket/widget/

# Option B: Docker
docker build -t oodles-widget:1.0.0 widget/
docker run -p 3001:3001 oodles-widget:1.0.0

# Option C: Direct Server
scp widget/dist/oodles-widget.js user@server:/var/www/widget/
```

#### Inject in Admin HTML

```html
<!-- admin/src/index.html or main layout -->
<script>
  window.OodlesWidgetConfig = {
    clientId: 'your-client-id',
    apiBase: 'https://api.oodleserp.com',  // or import.meta.env.VITE_API_BASE
    position: 'bottom-right'
  };
</script>
<script src="https://your-cdn.com/widget/oodles-widget.js"></script>
<!-- or for local dev: <script src="http://localhost:3001/oodles-widget.js"></script> -->
```

#### Deploy Admin

```bash
aws s3 sync admin/dist/ s3://your-admin-bucket/
# or
scp -r admin/dist/* user@server:/var/www/admin/
```

**Pros:** Reuse in multiple apps, independent updates, better caching
**Cons:** More setup, extra server/CDN needed, CORS considerations

---

### Method 2: Bundled Widget with Admin (Simpler Setup)

Widget is bundled and deployed together with admin dashboard.

#### Build & Bundle

```bash
cd oodles-chat-bot-frontend

# Build widget
cd widget && npm run build

# Copy widget to admin public folder
mkdir -p ../admin/public/widget
cp dist/oodles-widget.js ../admin/public/widget/

# Build admin (now includes widget)
cd ../admin && npm run build
# Output: admin/dist/ (with widget bundled)
```

#### Inject in Admin HTML

```html
<!-- admin/src/index.html -->
<script>
  window.OodlesWidgetConfig = {
    clientId: 'your-client-id',
    apiBase: import.meta.env.VITE_API_BASE
  };
</script>
<script src="/widget/oodles-widget.js"></script>
```

#### Deploy

```bash
# Deploy everything together
aws s3 sync admin/dist/ s3://your-admin-bucket/ --delete
# or
scp -r admin/dist/* user@server:/var/www/admin/
```

**Pros:** Simpler deployment, single version control, no CORS issues
**Cons:** Can't reuse widget, larger admin bundle, updates must be together

---

## 📦 Build Commands

```bash
# Build widget only
cd widget && npm run build

# Build admin only
cd admin && npm run build

# Build both (from root)
cd oodles-chat-bot-frontend
cd widget && npm run build && cd ../admin && npm run build
```

---

## 🐳 Docker Deployment

### Standalone Widget Dockerfile

```dockerfile
# widget/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:18-alpine
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001"]
```

### Admin Dockerfile

```dockerfile
# admin/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  widget:
    build:
      context: ./widget
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production

  admin:
    build:
      context: ./admin
    ports:
      - "3000:3000"
    depends_on:
      - widget
```

**Run:**
```bash
docker-compose up -d
```

---

## 🚢 Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Admin Dashboard
    location / {
        root /var/www/admin/dist;
        try_files $uri /index.html;
    }

    # Widget Service (if separate)
    location /widget/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Caching
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_set_header Host $host;
    }
}
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Both packages build without errors: `npm run build`
- [ ] No console errors (F12 in browser)
- [ ] No network errors (F12 Network tab)
- [ ] `.env.production` has correct URLs
- [ ] API endpoints verified
- [ ] CORS configured on backend

### Deployment
- [ ] Build widget: `cd widget && npm run build`
- [ ] Build admin: `cd admin && npm run build`
- [ ] Upload files to server/CDN
- [ ] Verify files are accessible
- [ ] Update DNS/domain settings if needed

### Post-Deployment
- [ ] Widget appears on page
- [ ] Chat functionality works (F12 Console)
- [ ] No CORS errors
- [ ] API responses working
- [ ] Mobile responsive
- [ ] Test on different browsers

---

## 🔍 Troubleshooting

### Widget Not Appearing?

**Check Console (F12):**
```javascript
console.log(window.OodlesWidget);      // Should not be undefined
console.log(window.__OODLES_CONFIG__);  // Should show your config
```

**Check Network Tab (F12):**
- Look for `oodles-widget.js` request
- Status should be **200 OK**
- File size should be ~100-150KB

**Common Issues:**
- 404 Error: File not deployed or wrong path
- CORS Error: Widget server not configured for cross-origin
- Blank Console: Script loaded but had JS errors

### API Connection Issues?

1. Check `.env.production` has correct API URL
2. Verify backend is running and accessible
3. Check Network tab for failed API requests
4. Verify CORS headers on backend:
   ```javascript
   res.header('Access-Control-Allow-Origin', '*');
   ```

### Build Errors?

```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
npm install
npm run build
```

---

## 📞 Common Commands

| Task | Command |
|------|---------|
| Install widget deps | `cd widget && npm install` |
| Install admin deps | `cd admin && npm install` |
| Dev widget | `cd widget && npm run dev` |
| Dev admin | `cd admin && npm run dev` |
| Build widget | `cd widget && npm run build` |
| Build admin | `cd admin && npm run build` |
| Check build size | `ls -lh widget/dist/oodles-widget.js` |
| Deploy widget | `aws s3 cp widget/dist/oodles-widget.js s3://bucket/` |
| Deploy admin | `aws s3 sync admin/dist/ s3://bucket/` |

---

## 🔐 Security Notes

- Never commit `.env.production` with real values
- Use environment variables for API keys
- Ensure HTTPS in production
- Configure CORS properly (not `*` for production)
- Enable rate limiting on backend
- Validate all user inputs on backend

---

## 📊 Port Reference

| Service | Port | URL |
|---------|------|-----|
| Admin Dev | 3000 | http://localhost:3000 |
| Widget Dev | 5173 | http://localhost:5173 |
| Widget Serve | 3001 | http://localhost:3001 |
| Backend API | 8001 | http://localhost:8001 |

---

## 🎯 Quick Decision: Which Method?

**Choose Method 1 (Standalone) if:**
- Widget needs to be used by multiple applications
- Widget updates frequently
- You have DevOps infrastructure
- You want independent scaling

**Choose Method 2 (Bundled) if:**
- Only admin application uses widget
- Single deployment process
- Smaller team
- Simpler maintenance

---



---

## 🔄 Version Management

```bash
# Update widget version
cd widget && npm version minor

# Update admin version
cd admin && npm version minor

# Create git tags
git tag widget-v1.0.0
git tag admin-v1.0.0
git push origin --tags
```

---

## 📚 Summary

1. **Development:** Run 2-3 dev servers locally
2. **Build:** `npm run build` in each package
3. **Deploy:** Choose Method 1 (separate) or Method 2 (bundled)
4. **Verify:** Check console, network, and functionality
5. **Monitor:** Watch for errors in production

For more details on specific deployment platforms, refer to your hosting provider's documentation.