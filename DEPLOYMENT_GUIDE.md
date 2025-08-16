# 🚀 BerseMuka Full-Stack Deployment Guide

## Complete Production Deployment with Best Practices

### 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CloudFlare                          │
│                      (CDN & DDoS Protection)                │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer (Nginx)                  │
└─────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                              │
┌───────▼────────┐                          ┌─────────▼────────┐
│   Frontend     │                          │    Backend API    │
│  React (3000)  │                          │   Node.js (3001)  │
└────────────────┘                          └──────────────────┘
                                                      │
                              ┌───────────────────────┼──────────────────────┐
                              │                       │                      │
                    ┌─────────▼────────┐   ┌─────────▼────────┐   ┌─────────▼────────┐
                    │   PostgreSQL     │   │      Redis       │   │      S3/CDN      │
                    │    (Primary)     │   │     (Cache)      │   │     (Assets)     │
                    └──────────────────┘   └──────────────────┘   └──────────────────┘
```

## 🔧 Pre-Deployment Checklist

### Backend Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates obtained
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] Error logging setup
- [ ] Health check endpoints working
- [ ] API documentation updated
- [ ] Security headers configured
- [ ] Backup strategy implemented

### Frontend Checklist
- [ ] Production build optimized
- [ ] Environment variables set
- [ ] PWA manifest configured
- [ ] Service worker tested
- [ ] SEO meta tags added
- [ ] Analytics integrated
- [ ] Error tracking setup
- [ ] Performance monitoring added
- [ ] Accessibility tested
- [ ] Browser compatibility verified

## 📦 1. Environment Setup

### Production Environment Variables

```bash
# .env.production

# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5433/bersemuka_prod
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
COOKIE_SECRET=your_cookie_secret_min_16_chars
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://bersemuka.com,https://www.bersemuka.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@bersemuka.com

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NEW_RELIC_LICENSE_KEY=xxx

# Frontend
VITE_API_URL=https://api.bersemuka.com/api/v1
VITE_WS_URL=wss://api.bersemuka.com
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🐳 2. Docker Production Setup

### Multi-Stage Production Dockerfile

```dockerfile
# Dockerfile.production

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm run prisma:generate

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy production files
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

# Create directories
RUN mkdir -p /app/logs /app/uploads
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
```

### Docker Compose Production

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: bersemuka-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
    networks:
      - bersemuka-network
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.production
    container_name: bersemuka-backend
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    networks:
      - bersemuka-network
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  postgres:
    image: postgres:15-alpine
    container_name: bersemuka-postgres
    environment:
      POSTGRES_DB: bersemuka_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - bersemuka-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bersemuka-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - bersemuka-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  bersemuka-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

## 🔒 3. Nginx Configuration

```nginx
# nginx/nginx.conf

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Upstream
    upstream backend {
        least_conn;
        server backend:3001 max_fails=3 fail_timeout=30s;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name bersemuka.com www.bersemuka.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name bersemuka.com www.bersemuka.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com; style-src 'self' 'unsafe-inline';" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            expires 1d;
            add_header Cache-Control "public, immutable";
        }

        # API
        location /api {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 90;
        }

        # WebSocket
        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://backend/health;
        }

        # Static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 🚀 4. Deployment Scripts

### Deploy Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Load environment
export $(cat .env.production | xargs)

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Run migrations
echo "🗄️ Running database migrations..."
npm run prisma:migrate:prod

# Build application
echo "🔨 Building application..."
npm run build

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.production.yml build

# Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f docker-compose.production.yml down

# Start new containers
echo "✨ Starting new containers..."
docker-compose -f docker-compose.production.yml up -d

# Health check
echo "🏥 Running health check..."
sleep 10
curl -f http://localhost/health || exit 1

echo "✅ Deployment successful!"
```

### Rollback Script

```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 Starting rollback..."

# Get previous version
PREVIOUS_VERSION=$(git rev-parse HEAD~1)

echo "📦 Rolling back to version: $PREVIOUS_VERSION"

# Checkout previous version
git checkout $PREVIOUS_VERSION

# Rebuild and restart
./deploy.sh

echo "✅ Rollback successful!"
```

## 📊 5. Monitoring Setup

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'bersemuka-api',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Health Check Script

```typescript
// src/monitoring/healthCheck.ts
import axios from 'axios';
import { sendAlert } from './alerting';

const endpoints = [
  'https://api.bersemuka.com/health',
  'https://api.bersemuka.com/api/v1/health',
  'https://bersemuka.com'
];

async function checkHealth() {
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, { timeout: 5000 });
      
      if (response.status !== 200) {
        await sendAlert(`Health check failed for ${endpoint}: Status ${response.status}`);
      }
    } catch (error) {
      await sendAlert(`Health check failed for ${endpoint}: ${error.message}`);
    }
  }
}

// Run every 5 minutes
setInterval(checkHealth, 5 * 60 * 1000);
```

## 🔐 6. Security Hardening

### SSL Certificate with Let's Encrypt

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d bersemuka.com -d www.bersemuka.com

# Auto-renewal
sudo crontab -e
# Add: 0 0 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration

```bash
# UFW setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### Database Security

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE bersemuka_prod TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
```

## 📈 7. Performance Optimization

### CDN Configuration (CloudFlare)

1. Add domain to CloudFlare
2. Configure DNS records
3. Enable following features:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3 (QUIC)
   - Automatic HTTPS Rewrites
   - Always Use HTTPS
   - Cache Level: Standard
   - Browser Cache TTL: 30 days

### Redis Caching Strategy

```typescript
// src/services/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  static async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  static async warmUp(): Promise<void> {
    // Pre-cache frequently accessed data
    const popularEvents = await EventService.getPopular();
    await this.set('events:popular', popularEvents, 1800);
    
    const categories = await CategoryService.getAll();
    await this.set('categories:all', categories, 86400);
  }
}
```

## 🔄 8. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app/bersemuka
            git pull origin main
            npm ci --production
            npm run build
            npm run prisma:migrate:prod
            pm2 reload ecosystem.config.js
            
      - name: Verify deployment
        run: |
          sleep 30
          curl -f https://api.bersemuka.com/health || exit 1
```

## 📱 9. Mobile App Deployment

### Android (Google Play Store)

```bash
# Build APK
cd android
./gradlew assembleRelease

# Build App Bundle
./gradlew bundleRelease

# Sign the bundle
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app/build/outputs/bundle/release/app-release.aab \
  my-key-alias
```

### iOS (App Store)

```bash
# Build for release
cd ios
xcodebuild -workspace BerseMuka.xcworkspace \
  -scheme BerseMuka \
  -configuration Release \
  -archivePath build/BerseMuka.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/BerseMuka.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

## 📊 10. Post-Deployment Checklist

### Monitoring
- [ ] Uptime monitoring active (UptimeRobot/Pingdom)
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring setup (New Relic/DataDog)
- [ ] Log aggregation working (ELK Stack/Papertrail)
- [ ] Alerts configured for critical errors

### Performance
- [ ] Lighthouse score > 90
- [ ] Time to First Byte < 200ms
- [ ] Core Web Vitals passing
- [ ] CDN caching verified
- [ ] Database queries optimized

### Security
- [ ] SSL certificate valid
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] OWASP Top 10 addressed
- [ ] Penetration testing completed

### Backup
- [ ] Database backups scheduled
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Data retention policy implemented

## 🎯 Performance Targets

- **Uptime**: 99.9% (< 8.76 hours downtime/year)
- **Response Time**: p50 < 100ms, p95 < 500ms, p99 < 1s
- **Error Rate**: < 0.1%
- **Concurrent Users**: 10,000+
- **Database Connections**: < 100 active
- **Memory Usage**: < 70% of available
- **CPU Usage**: < 60% average

## 🚨 Incident Response

### Severity Levels
- **P0**: Complete service outage
- **P1**: Major feature unavailable
- **P2**: Minor feature degraded
- **P3**: Cosmetic issues

### Response Times
- **P0**: 15 minutes
- **P1**: 1 hour
- **P2**: 4 hours
- **P3**: 24 hours

### Rollback Procedure
1. Identify the issue
2. Notify stakeholders
3. Execute rollback script
4. Verify service restoration
5. Post-mortem analysis

## 📞 Support Contacts

- **DevOps Lead**: devops@bersemuka.com
- **Security Team**: security@bersemuka.com
- **Database Admin**: dba@bersemuka.com
- **On-Call Engineer**: +60-XXX-XXXX

---

Your BerseMuka app is now ready for production deployment with enterprise-grade infrastructure, monitoring, and security! 🚀