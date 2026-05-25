# AlphaBank Deployment Guide

## Deployment Instructions for Multiple Platforms

---

## 🚀 Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Admin credentials changed from default
- [ ] Gemini API key is valid (or remove for KB-only mode)
- [ ] Build process completes without errors
- [ ] All tests pass
- [ ] Dependencies are up to date
- [ ] Security audit completed
- [ ] HTTPS enabled (required for production)
- [ ] Error logging configured
- [ ] Analytics/monitoring setup

---

## 📦 Build Process

### 1. Local Build & Testing

```bash
# Install dependencies
npm install

# Run development server (test locally)
npm run dev

# Verify app runs without errors at http://localhost:3000
# Test key flows: signup, login, transfer, loan application, admin access
```

### 2. Production Build

```bash
# Create optimized production build
npm run build

# Output generated in 'dist/' folder
# Contains minified, tree-shaken, and optimized assets

# Preview production build locally
npm run preview
```

### 3. Build Output

```
dist/
├── index.html           # Entry HTML file
├── assets/
│   ├── index-*.js       # Main application bundle (minified)
│   ├── main-*.css       # Main styles bundle (minified)
│   └── [vendor bundles] # Third-party library chunks
└── vite.svg             # Static assets
```

---

## 🔧 Environment Configuration

### Create `.env` File

```bash
# .env (commit to repo with default values, override in production)

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_api_key_here_or_leave_empty

# Optional: Backend API (if migrating to backend)
VITE_API_BASE_URL=https://api.alphabank.in

# Optional: Analytics
VITE_GA_ID=G-xxxxxxxxxx
```

### Production Environment Variables

```bash
# .env.production (create this, don't commit)

VITE_GEMINI_API_KEY=your_production_key
VITE_API_BASE_URL=https://api.alphabank.in
VITE_ENV=production
```

### Build with Environment

```bash
# Build with production environment
npm run build

# The build will automatically use .env and .env.production
```

---

## 🚢 Deploy to Vercel

### Option 1: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Select framework: Vite
# - Select project directory: ./
# - Override settings: No
# - Deploy: Yes
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework: Vite
   - Root directory: ./
   - Build command: npm run build
   - Output directory: dist
6. Add environment variables:
   - `VITE_GEMINI_API_KEY` (your API key)
7. Click "Deploy"

### Vercel Configuration File

```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_GEMINI_API_KEY": "@gemini_api_key"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Domain Setup

```bash
# Add custom domain
vercel domains add alphabank.in

# Vercel will provide DNS records to update in domain registrar
```

---

## 🌐 Deploy to Netlify

### Option 1: CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from project root
netlify deploy --prod --dir=dist

# Or without --prod flag for preview deployment
netlify deploy --dir=dist
```

### Option 2: GitHub Integration

1. Build project: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect GitHub account
5. Select repository
6. Configure:
   - Build command: npm run build
   - Publish directory: dist
7. Add environment variables:
   - `VITE_GEMINI_API_KEY`
8. Click "Deploy site"

### Netlify Configuration File

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Custom Domain

```bash
# In Netlify dashboard:
# Site settings > Domain management > Add custom domain
# Then update DNS records at domain registrar
```

---

## ☁️ Deploy to AWS Amplify

### 1. AWS Amplify Console

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting
# Choose: Amazon CloudFront and S3

# Deploy
amplify publish
```

### 2. Manual S3 + CloudFront

```bash
# Build project
npm run build

# Create S3 bucket
aws s3 mb s3://alphabank-prod-bucket \
  --region us-east-1

# Upload build files
aws s3 sync dist/ s3://alphabank-prod-bucket \
  --region us-east-1 \
  --delete

# Create CloudFront distribution (via AWS Console)
# - Origin: S3 bucket
# - Default root object: index.html
# - Error pages: /index.html for 404
# - SSL certificate from ACM
```

### AWS IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::alphabank-prod-bucket/*"
    }
  ]
}
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000

ENV VITE_GEMINI_API_KEY=""
ENV VITE_API_BASE_URL=""

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### .dockerignore

```
node_modules
.git
.gitignore
README.md
FEATURES.md
DEPLOYMENT.md
.env.local
.DS_Store
dist
```

### Build & Run Docker Image

```bash
# Build image
docker build -t alphabank:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e VITE_GEMINI_API_KEY="your_key" \
  --name alphabank-app \
  alphabank:latest

# Check logs
docker logs alphabank-app

# Stop container
docker stop alphabank-app
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: alphabank:latest
    ports:
      - "3000:3000"
    environment:
      - VITE_GEMINI_API_KEY=your_key_here
      - VITE_API_BASE_URL=https://api.alphabank.in
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Docker Hub

```bash
# Tag image
docker tag alphabank:latest yourusername/alphabank:latest

# Push to Docker Hub
docker push yourusername/alphabank:latest

# Pull from any server
docker pull yourusername/alphabank:latest
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test --if-present
      
      - name: Build
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🔒 Security Configuration

### Security Headers (Netlify)

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### HTTPS/SSL

- **Netlify:** Automatic Let's Encrypt certificate
- **Vercel:** Automatic SSL/TLS certificate
- **AWS:** Use ACM (AWS Certificate Manager)
- **Custom Server:** Use Certbot (Let's Encrypt)

### Environment Secrets

Store sensitive values as platform secrets:

**Vercel:**
```bash
vercel env add VITE_GEMINI_API_KEY
# Enter secret value (hidden)
# Select environments: production, preview, development
```

**Netlify:**
```bash
# Go to Site settings > Environment variables
# Add variable with name and value
```

---

## 📊 Performance Optimization

### Build Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check what's in dist/
du -sh dist/
ls -lh dist/assets/
```

### Caching Strategy

```javascript
// Netlify/Vercel automatic caching:
// - index.html: No cache (always fresh)
// - assets/: 1 year cache (versioned with hash)
// - Everything else: 60 second cache

// Manual control in vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Image Optimization

- All images are currently embedded (inline)
- If adding external images:
  ```bash
  npm install sharp
  # Use in build process to optimize
  ```

---

## 🧪 Testing Before Production

### Local Testing

```bash
# Start production build locally
npm run preview

# Test in browser: http://localhost:4173
# Check console for errors (F12)
# Test all flows:
# - User signup & login
# - Transfer money
# - Apply for loan
# - Admin login & approve requests
# - Dark mode toggle
# - Mobile responsiveness
```

### Production Testing

After deploying to production:

1. **Functionality Test**
   - Signup new account
   - Transfer money
   - Apply for loan
   - Check rewards

2. **Performance Test**
   - Lighthouse score (aim for >90)
   - Page load time (target <3s)
   - Time to Interactive (target <5s)

3. **Security Test**
   - Check HTTPS enabled
   - Verify security headers (F12 > Network > Headers)
   - Test CORS policies
   - Validate API calls

4. **Browser Compatibility**
   - Chrome/Edge (latest)
   - Firefox (latest)
   - Safari (latest)
   - Mobile browsers

---

## 🚨 Troubleshooting Deployment

### Problem: Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build

# Check Node version
node --version  # Should be 16+

# Check for env variable issues
cat .env.production
```

### Problem: 404 Errors on Routes

Add SPA redirect to hosting platform:

**Vercel:** Automatic
**Netlify:** Add to netlify.toml:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Problem: CORS Errors

If using backend API, add CORS headers:

```javascript
// Example backend CORS header
Access-Control-Allow-Origin: https://alphabank.in
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### Problem: Environment Variables Not Working

```bash
# Ensure prefix VITE_ for client-side variables
# ✅ Correct: VITE_GEMINI_API_KEY
# ❌ Wrong: GEMINI_API_KEY

# Rebuild after adding env variables
npm run build
```

---

## 📈 Monitoring & Logging

### Error Tracking (Sentry)

```javascript
// Add to main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://key@sentry.io/project",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Analytics (Google Analytics)

```javascript
// Add to App.jsx
import { useEffect } from 'react';

useEffect(() => {
  window.gtag?.('config', 'G-XXXXXXXXXX');
  // Track page views
  window.gtag?.('event', 'page_view');
}, [location]);
```

### Application Monitoring

- **Vercel Analytics:** Automatic (dashboard.vercel.com)
- **Netlify Analytics:** Available (app.netlify.com)
- **Google Lighthouse:** Test regularly

---

## 🔄 Continuous Updates

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update to latest major versions (caution)
npm install react@latest react-router-dom@latest tailwindcss@latest
```

### Rollback Procedure

```bash
# On Vercel: Deployments page > Rollback button
# On Netlify: Deploy history > Publish deployed version
# On AWS: CloudFormation stack > Update stack with previous version
# Docker: docker run yourusername/alphabank:previous-tag
```

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] App loads at production URL
- [ ] All pages accessible without 404 errors
- [ ] Signup/login flow working
- [ ] Transfers execute successfully
- [ ] Dark mode persists
- [ ] Admin console accessible and functional
- [ ] Notifications appear correctly
- [ ] Lighthouse score > 90
- [ ] Security headers present
- [ ] No console errors (F12)
- [ ] Mobile responsiveness verified
- [ ] Admin credentials changed from default
- [ ] Error monitoring configured
- [ ] Backup of data/configuration created
- [ ] Team notified of deployment
- [ ] Monitoring alerts set up

---

## 📞 Support & Escalation

**Deployment Issues:**
- Contact Vercel/Netlify support
- Check platform status page
- Review build logs in dashboard

**Code Issues:**
- Check browser console (F12)
- Review GitHub Actions logs
- Test locally with: npm run preview

**Performance Issues:**
- Run Lighthouse audit
- Analyze bundle size: npm run build -- --analyze
- Clear CDN cache (platform dashboard)

---

## 🎓 References

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Netlify Deploy Docs](https://docs.netlify.com)
- [Google Gemini API](https://ai.google.dev)

---

**Version 2.0.0 — Last Updated: May 2026**

*For questions or issues, contact: devops@alphabank.in*
